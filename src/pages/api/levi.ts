import type { NextApiRequest, NextApiResponse } from "next";
import { ResponseFuncs } from "../../../utils/types";
import {
	DefaultLogger,
	FuturesAccountBalance,
	FuturesOrderType,
	FuturesPosition,
	OrderResult,
	OrderSide,
	USDMClient,
	WebsocketClient,
	WsUserDataEvents,
	numberInString,
} from "binance";
import { getSession } from "next-auth/react";
import axios from "axios";

export const config = {
	api: {
		externalResolver: true,
	},
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const catcher = (error: Error) => res.status(400).json({ error });
	const API_KEY = process.env.NEXT_PUBLIC_BINANCE_KEY_LEVI;
	const API_SECRET = process.env.NEXT_PUBLIC_BINANCE_SECRET_LEVI;

	const client = new USDMClient({
		api_key: API_KEY,
		api_secret: API_SECRET,
	});

	const wsBinance = new WebsocketClient({
		api_key: API_KEY,
		api_secret: API_SECRET,
		beautify: true,
	});

	const method: keyof ResponseFuncs = req.method as keyof ResponseFuncs;

	const handleCase: ResponseFuncs = {
		GET: async (req: NextApiRequest, res: NextApiResponse) => {},

		POST: async (req: NextApiRequest, res: NextApiResponse) => {
			const session = await getSession({ req });

			if (session) {
				const ignoredSillyLogMsgs = [
					"Sending ping",
					"Received pong, clearing pong timer",
					"Received ping, sending pong frame",
				];

				const logger = {
					...DefaultLogger,
					silly: (msg: any, context: any) => {
						if (ignoredSillyLogMsgs.includes(msg)) {
							return;
						}
						console.log(JSON.stringify({ msg, context }));
					},
				};

				const getPositions = async () => {
					const positions = await client
						.getPositions()
						.then((result) => {
							return result.filter((val) => val.entryPrice !== "0.0");
						})
						.catch((error) => error);
					return positions;
				};

				const getPosition = async (symbol: string) => {
					const allPositions = await getPositions()
						.then((res) => res)
						.catch((err) => console.log(err));
					const onePosition: FuturesPosition[] = allPositions.filter(
						(pos: FuturesPosition) => pos.symbol === symbol,
					);
					return onePosition[0];
				};

				const getOpenOrders = async (symbol: string) => {
					const allOrders = await client
						.getAllOpenOrders({ symbol })
						.then((res) => res)
						.catch((err) => console.log(err));
					return allOrders;
				};

				const getBalance = async (assetSymbol: string) => {
					const allAssetBalances = await client
						.getBalance()
						.then((res) => {
							const positionAssetBalance = res.filter(
								(asset: FuturesAccountBalance) => asset.asset === assetSymbol,
							);
							return positionAssetBalance[0].availableBalance;
						})
						.catch((err) => console.log(err));

					return allAssetBalances;
				};

				const exchangeInfo = async (symbol: string) => {
					const precisions = await axios
						.get("https://fapi.binance.com/fapi/v1/exchangeInfo")
						.then((res) => {
							const symbolInfoArray = res.data.symbols.filter(
								(sym: any) => sym.symbol === symbol,
							);
							const tickSize =
								symbolInfoArray[0]["filters"]
									.filter((filter: any) => filter.filterType === "PRICE_FILTER")[0]
									.tickSize.split(".")
									.pop()
									.indexOf("1") + 1;
							const stepSize = symbolInfoArray[0]["filters"].filter(
								(filter: any) => filter.filterType === "LOT_SIZE",
							)[0];

							const place =
								Number(stepSize.stepSize) < 1
									? stepSize.stepSize.split(".").pop().indexOf("1") + 1
									: 0;
							return [tickSize, place];
						});
					return precisions;
				};
				// wsBinance.on("open", (event) => {
				// 	console.log(event);
				// });
				wsBinance.subscribeUsdFuturesUserDataStream(false, true);

				wsBinance.on(
					"formattedUserDataMessage",
					async (event: WsUserDataEvents) => {
						console.log("LEVI:::: ", event);
						if (event.eventType === "ORDER_TRADE_UPDATE") {
							const position = await getPosition(event.order.symbol);
							const openOrders: void | OrderResult[] = await getOpenOrders(
								event.order.symbol,
							);
							const precisions = await exchangeInfo(event.order.symbol);

							const entryPrice: number = position ? Number(position.entryPrice) : 0;

							const liquidationPrice = position
								? Number(position.liquidationPrice)
								: 0;
							const posAmount = position
								? Number(position.positionAmt) > 0
									? Number(position.positionAmt)
									: -1 * Number(position.positionAmt)
								: 0;
							const entryMargin = position
								? Number(position.isolatedWallet) > 11
									? Number(position.isolatedWallet)
									: 11
								: 0;
							const takeProfitSide: OrderSide =
								event.order.orderSide === "SELL" ? "BUY" : "SELL";
							const takeProfitPrice: number = position
								? entryMargin / 2.5 / Number(position.positionAmt) + entryPrice
								: 0;
							const takeProfitPricePartial: number = position
								? entryMargin / 4 / Number(position.positionAmt) + entryPrice
								: 0;
							const orderPrice: number = position
								? entryMargin / -2 / Number(position.positionAmt) + entryPrice
								: 0;
							if (event.order.orderStatus === "FILLED" && !event.order.isReduceOnly) {
								if (event.order.executionType === "TRADE") {
									console.log(
										entryPrice,
										"; ",
										liquidationPrice,
										"; ",
										Number(position.positionAmt),
										"; ",
										takeProfitSide,
										":",
										takeProfitPrice,
										";",
										takeProfitPricePartial,
										";",
										orderPrice,
										position.leverage + "x",
									);
									if (Number(position.isolatedWallet) > 40) {
										await client.submitNewOrder({
											symbol: event.order.symbol,
											side: takeProfitSide,
											type: "STOP_MARKET",
											stopPrice: Number(orderPrice.toFixed(precisions[0])),
											timeInForce: "GTC",
											closePosition: "true",
										});
									} else {
										await client.submitNewOrder({
											symbol: event.order.symbol,
											side: event.order.orderSide,
											type: "LIMIT",
											quantity: Number((posAmount / 2).toFixed(precisions[1])),
											price: Number(orderPrice.toFixed(precisions[0])),
											timeInForce: "GTC",
										});
									}
									if (openOrders && !!openOrders.length) {
										const takeProfitOrders: OrderResult[] = openOrders.filter(
											(order: OrderResult) => order.origType === "TAKE_PROFIT",
										);
										takeProfitOrders.map(async (order) => {
											await client
												.cancelOrder({
													symbol: event.order.symbol,
													orderId: order.orderId,
												})
												.then((res) => res)
												.catch((error) => console.log(error));
										});
									}
									await client.submitNewOrder({
										symbol: event.order.symbol,
										side: takeProfitSide,
										type: "TAKE_PROFIT",
										stopPrice: Number(takeProfitPrice.toFixed(precisions[0])),
										closePosition: "true",
										priceProtect: "TRUE",
										timeInForce: "GTC",
									});
									await client.submitNewOrder({
										symbol: event.order.symbol,
										side: takeProfitSide,
										type: "TAKE_PROFIT",
										quantity: Number((posAmount / 2).toFixed(precisions[1])),
										price: Number(takeProfitPricePartial.toFixed(precisions[0])),
										stopPrice: Number(takeProfitPricePartial.toFixed(precisions[0])),
										priceProtect: "TRUE",
										timeInForce: "GTC",
										reduceOnly: "true",
									});
								}
							} else if (
								event.order.orderStatus === "FILLED" &&
								event.order.originalOrderType === "TAKE_PROFIT"
							) {
								const orderSide: OrderSide =
									event.order.orderSide === "SELL" ? "BUY" : "SELL";

								if (openOrders && !!openOrders.length) {
									const limitOrStopOrders: OrderResult[] = openOrders.filter(
										(order: OrderResult) =>
											order.origType === "LIMIT" || order.origType === "STOP_MARKET",
									);
									limitOrStopOrders.map(async (order) => {
										await client
											.cancelOrder({
												symbol: event.order.symbol,
												orderId: order.orderId,
											})
											.then((res) => res)
											.catch((error) => console.log(error));
									});
								}
								await client.submitNewOrder({
									symbol: event.order.symbol,
									side: orderSide,
									type: "LIMIT",
									quantity: Number((posAmount / 2).toFixed(precisions[1])),
									price: Number(orderPrice.toFixed(precisions[0])),
									timeInForce: "GTC",
								});
							} else if (
								event.order.orderStatus === "FILLED" &&
								event.order.isReduceOnly
							) {
								if (openOrders && !!openOrders.length) {
									openOrders.map(async (order: OrderResult) => {
										await client
											.cancelOrder({
												symbol: event.order.symbol,
												orderId: order.orderId,
											})
											.then((res) => res)
											.catch((error) => console.log(error));
									});
								}
							}
						}
					},
				);

				console.log("Setting up socket Levi");

				res.end();
			} else {
				// Not Signed in
				res.status(401).json({ message: "Reaalllyy???" });
			}
			res.end();
		},
	};
	const response = handleCase[method];

	if (response) response(req, res);
	else res.status(400).json({ error: "No response for this request" });
}
