import type { NextApiRequest, NextApiResponse } from "next";
import { ResponseFuncs, TUser } from "../../../utils/types";
import { WebsocketClient, WsUserDataEvents } from "binance";
import User from "../../../model/User";
import { connect } from "../../../utils/connection";
import axios from "axios";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const method: keyof ResponseFuncs = req.method as keyof ResponseFuncs;

	const handleCase: ResponseFuncs = {
		POST: async (req: NextApiRequest, res: NextApiResponse) => {
			await connect();
			const userId = req.body.userId;
			console.log(userId);
			const API_KEY = process.env[`NEXT_PUBLIC_BINANCE_KEY_${userId}`];
			const API_SECRET = process.env[`NEXT_PUBLIC_BINANCE_SECRET_${userId}`];
			console.log(API_KEY, API_SECRET);
			try {
				const wsBinance = new WebsocketClient({
					api_key: API_KEY,
					api_secret: API_SECRET,
					beautify: true,
				});

				wsBinance.subscribeUsdFuturesUserDataStream(false, true);
				wsBinance.on("open", async (event) => {
					try {
						const saveWsKey = await User.findOneAndUpdate(
							{ _id: userId },
							{
								wsKey: event.wsKey,
							},
							{ new: true },
						);
					} catch (error) {
						console.log(error);
						return res.status(401).json({ error });
					}
				});

				wsBinance.on(
					"formattedUserDataMessage",
					async (event: WsUserDataEvents) => {
						console.log(event);
						if (event.eventType === "ORDER_TRADE_UPDATE") {
							const userWsKey = event.wsKey;

							try {
								// const user: TUser | null = await User.findOne({ wsKey: userWsKey });
								// const symbol: string = event.order.symbol;
								// const findKeyByValue = (obj: any, value: string) => {
								// 	return Object.keys(obj).find((key) => obj[key].includes(value));
								// };
								// const strategy = findKeyByValue(user?.strategies, symbol);
								// const body = {
								// 	symbol,
								// 	event,
								// 	userId,
								// };
								// await axios.post(
								// 	"http://localhost:3000/api/strategies/" + strategy,
								// 	body,
								// );
							} catch (error) {
								console.log(error);
								return "No user found";
							}
						}
					},
				);
			} catch (error) {
				console.log(error);
				return res.status(401).json({ error });
			}
			return res.status(200).json("Connection established");
		},
	};

	const response = handleCase[method];

	if (response) response(req, res);
	else res.status(400).json({ error: "No response for this request" });
}
