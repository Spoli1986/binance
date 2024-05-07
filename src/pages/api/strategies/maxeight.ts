import type { NextApiRequest, NextApiResponse } from "next";
import { ResponseFuncs } from "../../../../utils/types";
import {
	FuturesAccountBalance,
	FuturesPosition,
	OrderResult,
	OrderSide,
	USDMClient,
	WebsocketClient,
	WsUserDataEvents,
} from "binance";

import { getSession } from "next-auth/react";
import axios from "axios";

type Body = {
	userId: string;
	event: WsUserDataEvents;
	symbol: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const catcher = (error: Error) => res.status(400).json({ error });

	const method: keyof ResponseFuncs = req.method as keyof ResponseFuncs;

	const handleCase: ResponseFuncs = {
		POST: async (req: NextApiRequest, res: NextApiResponse) => {
			const { userId, event, symbol }: Body = req.body;

			const API_KEY = process.env[`NEXT_PUBLIC_BINANCE_KEY_${userId}`];
			const API_SECRET = process.env[`NEXT_PUBLIC_BINANCE_SECRET_${userId}`];

			const client = new USDMClient({
				api_key: API_KEY,
				api_secret: API_SECRET,
			});

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
						return positionAssetBalance[0].balance;
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

			console.log(userId + ":::: ", event);
			if (event.eventType === "ORDER_TRADE_UPDATE") {
				const balance = await getBalance(event.order.commissionAsset);
				const position = await getPosition(symbol);
				const openOrders: void | OrderResult[] = await getOpenOrders(symbol);
				const precisions = await exchangeInfo(symbol);

				const entryPrice: number = position ? Number(position.entryPrice) : 0;

				const liquidationPrice = position ? Number(position.liquidationPrice) : 0;

				const posDirection = position
					? Number(position.positionAmt) > 0
						? 1
						: -1
					: 0;

				const posAmount = position
					? Number(position.positionAmt) > 0
						? Number(position.positionAmt)
						: -1 * Number(position.positionAmt)
					: 0;
				const entryMargin = position
					? (Number(position.notional) / Number(position.leverage)) * posDirection >
					  11
						? (Number(position.notional) / Number(position.leverage)) * posDirection
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
						if (Number(position.isolatedWallet) > Number(balance) * 0.08) {
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
								symbol: symbol,
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
										symbol: symbol,
										orderId: order.orderId,
									})
									.then((res) => res)
									.catch((error) => console.log(error));
							});
						}
						await client.submitNewOrder({
							symbol: symbol,
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
									symbol: symbol,
									orderId: order.orderId,
								})
								.then((res) => res)
								.catch((error) => console.log(error));
						});
					}
					await client.submitNewOrder({
						symbol: symbol,
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
									symbol: symbol,
									orderId: order.orderId,
								})
								.then((res) => res)
								.catch((error) => console.log(error));
						});
					}
				}
			}

			console.log("Max2-8 for " + userId);

			res.end();
		},
	};
	const response = handleCase[method];

	if (response) response(req, res);
	else res.status(400).json({ error: "No response for this request" });
}
