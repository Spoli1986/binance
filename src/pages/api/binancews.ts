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
} from "binance";

export const config = {
	api: {
		externalResolver: true,
	},
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const catcher = (error: Error) => res.status(400).json({ error });

	const method: keyof ResponseFuncs = req.method as keyof ResponseFuncs;

	const handleCase: ResponseFuncs = {
		GET: async (req: NextApiRequest, res: NextApiResponse) => {
			const API_KEY = process.env.NEXT_PUBLIC_BINANCE_KEY;
			const API_SECRET = process.env.NEXT_PUBLIC_BINANCE_SECRET;

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
						return positionAssetBalance[0].availableBalance;
					})
					.catch((err) => console.log(err));

				return allAssetBalances;
			};
			const wsBinance = new WebsocketClient({
				api_key: API_KEY,
				api_secret: API_SECRET,
				beautify: true,
			});

			wsBinance.subscribeUsdFuturesUserDataStream(false, true);

			wsBinance.on("formattedUserDataMessage", async (event: WsUserDataEvents) => {
				console.log(event);
				if (event.eventType === "ORDER_TRADE_UPDATE") {
					const position = await getPosition(event.order.symbol);
					const balance = await getBalance(event.order.commissionAsset);
					const openOrders: void | OrderResult[] = await getOpenOrders(
						event.order.symbol,
					);

					if (event.order.orderStatus === "FILLED" && !event.order.isReduceOnly) {
						if (event.order.executionType === "TRADE") {
							const entryPrice: number = Number(position.entryPrice);
							const liquidationPrice = Number(position.liquidationPrice);
							const posAmount = Number(event.order.originalQuantity);
							const takeProfitSide: OrderSide = posAmount < 0 ? "BUY" : "SELL";
							const takeProfitPrice: number =
								posAmount < 0
									? entryPrice - (50 / Number(position.leverage) / 100) * entryPrice
									: entryPrice + (50 / Number(position.leverage) / 100) * entryPrice;
							const orderPrice: number =
								entryPrice - liquidationPrice > 0
									? entryPrice - (entryPrice - liquidationPrice) * 0.5
									: entryPrice + (liquidationPrice - entryPrice) * 0.5;
							console.log(
								entryPrice,
								"; ",
								liquidationPrice,
								"; ",
								posAmount,
								"; ",
								takeProfitSide,
								":",
								takeProfitPrice,
								";",
								orderPrice,
							);
							if (openOrders && !!openOrders.length) {
								openOrders.map(async (order) => {
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
								side: event.order.orderSide,
								type: "LIMIT",
								quantity: posAmount / 2,
								price: Number(orderPrice.toFixed(3)),
								timeInForce: "GTC",
							});
							await client.submitNewOrder({
								symbol: event.order.symbol,
								side: takeProfitSide,
								type: "TAKE_PROFIT_MARKET",
								stopPrice: Number(takeProfitPrice.toFixed(3)),
								closePosition: "true",
								priceProtect: "TRUE",
								timeInForce: "GTC",
							});
						}
					} else if (
						event.order.orderStatus === "FILLED" &&
						event.order.originalOrderType === "TAKE_PROFIT_MARKET"
					) {
						const leverage = Number(position.leverage);
						const lastFilledPrice = event.order.lastFilledPrice;
						const twoPercent = Number(balance) * 0.02;
						const quantity = twoPercent / (lastFilledPrice / leverage);
						const side: OrderSide = event.order.orderSide === "SELL" ? "BUY" : "SELL";
						if (!!openOrders)
							await client.cancelMultipleOrders({ symbol: event.order.symbol });
						await client.submitNewOrder({
							symbol: event.order.symbol,
							side: side,
							type: "MARKET",
							quantity: quantity,
						});
					}
				}
			});

			console.log("Setting up socket");

			res.end();
		},
	};
	const response = handleCase[method];

	if (response) response(req, res);
	else res.status(400).json({ error: "No response for this request" });
}
