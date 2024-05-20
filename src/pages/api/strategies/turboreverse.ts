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
				const position = await getPosition(event.order.symbol);
				const openOrders: void | OrderResult[] = await getOpenOrders(
					event.order.symbol,
				);

				const precisions = await exchangeInfo(event.order.symbol);

				const entryPrice: number = position ? Number(position.entryPrice) : 0;

				const posDirection = position
					? Number(position.positionAmt) > 0
						? 1
						: -1
					: 0;

				const entryMargin = position
					? (Number(position.notional) / Number(position.leverage)) * posDirection
					: 0;

				const takeProfitSide: OrderSide =
					event.order.orderSide === "SELL" ? "BUY" : "SELL";

				const takeProfitPrice: number = position
					? (entryMargin * 0.35) / Number(position.positionAmt) + entryPrice
					: 0;

				const stopLossPrice: number = position
					? (entryMargin * -0.23) / Number(position.positionAmt) + entryPrice
					: 0;

				if (
					event.order.orderStatus === "FILLED" &&
					!event.order.isReduceOnly &&
					event.order.originalOrderType !== "STOP"
				) {
					console.log(
						"stop loss: ",
						stopLossPrice,
						";",
						"take profit: ",
						takeProfitPrice,
					);
					if (event.order.executionType === "TRADE") {
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

						await client.submitNewOrder({
							symbol: event.order.symbol,
							side: takeProfitSide,
							type: "STOP",
							quantity: Number(
								(Number(position.positionAmt) * posDirection).toFixed(precisions[1]),
							),
							price: Number(stopLossPrice.toFixed(precisions[0])),
							stopPrice: Number(stopLossPrice.toFixed(precisions[0])),
							timeInForce: "GTC",
						});

						await client.submitNewOrder({
							symbol: event.order.symbol,
							side: takeProfitSide,
							type: "TAKE_PROFIT",
							price: Number(takeProfitPrice.toFixed(precisions[0])),
							quantity: Number(
								(Number(position.positionAmt) * posDirection).toFixed(precisions[1]),
							),
							stopPrice: Number(takeProfitPrice.toFixed(precisions[0])),
							priceProtect: "TRUE",
							timeInForce: "GTC",
						});
					}
				} else if (event.order.orderStatus === "FILLED") {
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
					if (event.order.originalOrderType === "TAKE_PROFIT") {
						await client.submitNewOrder({
							symbol: event.order.symbol,
							side: takeProfitSide,
							type: "MARKET",
							quantity: Number(event.order.originalQuantity),
						});
					} else if (event.order.originalOrderType === "STOP") {
						await client.submitNewOrder({
							symbol: event.order.symbol,
							side: event.order.orderSide,
							type: "MARKET",
							quantity: Number(event.order.originalQuantity),
						});
					}
				}
			}

			console.log("TurboReverse " + userId);

			res.end();
		},
	};
	const response = handleCase[method];

	if (response) response(req, res);
	else res.status(400).json({ error: "No response for this request" });
}
