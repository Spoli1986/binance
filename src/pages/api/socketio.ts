import {
	DefaultLogger,
	FuturesOrderType,
	OrderSide,
	USDMClient,
	WebsocketClient,
	WsUserDataEvents,
} from "binance";
import { Server } from "socket.io";

export const config = {
	api: {
		externalResolver: true,
	},
};

export default function SocketHandler(req: any, res: any) {
	// if (res.socket.server.io) {
	// 	console.log("Already set up");
	// 	res.end();
	// 	return;
	// }

	const API_KEY = process.env.NEXT_PUBLIC_BINANCE_KEY;
	const API_SECRET = process.env.NEXT_PUBLIC_BINANCE_SECRET;

	const client = new USDMClient({
		api_key: API_KEY,
		api_secret: API_SECRET,
	});

	const makeOrder = async (
		symbol: string,
		side: OrderSide,
		quantity: number,
		price: number,
	) => {
		try {
			const response = await client.submitNewOrder({
				symbol,
				side,
				type: "LIMIT",
				quantity,
				price,
				timeInForce: "GTC",
			});
			console.log(response);
		} catch (error) {
			console.log(error);
		}
	};

	const getPositions = async () => {
		const positions = await client.getPositions().then((result) => {
			return result.filter((val) => val.entryPrice !== "0.0");
		});
		return positions;
	};

	const getPosition = async (symbol: string) => {
		const allPositions = await getPositions();
		const onePosition = allPositions.filter((pos) => pos.symbol === symbol);
		return onePosition[0];
	};

	const wsBinance = new WebsocketClient({
		api_key: API_KEY,
		api_secret: API_SECRET,
		beautify: true,
	});
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
	const socketRootUrl = "/api/socketio";
	// const io = new Server(res.socket.server, {
	// 	path: socketRootUrl,
	// 	cors: {
	// 		origin: "*", // Replace with your allowed origin or use a more specific origin list
	// 		methods: ["GET", "POST"],
	// 	},
	// });

	// res.socket.server.io = io;

	wsBinance.subscribeAllMarketMarkPrice("usdm", 3000);
	wsBinance.subscribeUsdFuturesUserDataStream(false, true);
	wsBinance.on("message", (event: any) => {
		// console.log(event);
	});
	wsBinance.on("formattedUserDataMessage", async (event: WsUserDataEvents) => {
		if (event.eventType === "ORDER_TRADE_UPDATE") {
			if (event.order.orderStatus === "FILLED" && !event.order.isReduceOnly) {
				if (event.order.executionType === "TRADE") {
					const entryPrice = (await getPosition(event.order.symbol)).entryPrice;
					const liquidationPrice = (await getPosition(event.order.symbol))
						.liquidationPrice;
					const orderPrice: number =
						Number(entryPrice) - Number(liquidationPrice) > 0
							? Number(entryPrice) -
							  (Number(entryPrice) - Number(liquidationPrice)) * 0.9
							: Number(entryPrice) +
							  (Number(liquidationPrice) - Number(entryPrice)) * 0.9;
					makeOrder(
						event.order.symbol,
						event.order.orderSide,
						Number((event.order.originalQuantity * 2).toFixed(3)),
						Number(orderPrice.toFixed(3)),
					);
				}
			}
		}
		console.log(event);
	});
	// io.on("connection", (socket) => {});

	console.log("Setting up socket");
	res.end();
}
