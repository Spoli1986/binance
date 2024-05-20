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

			const API_KEY = process.env[`NEXT_PUBLIC_BINANCE_KEY_${userId}`];
			const API_SECRET = process.env[`NEXT_PUBLIC_BINANCE_SECRET_${userId}`];

			try {
				const wsBinance = new WebsocketClient({
					api_key: API_KEY,
					api_secret: API_SECRET,
					beautify: true,
				});

				wsBinance.closeWs(wsBinance);
				wsBinance.on("close", async (event) => {
					try {
						const saveWsKey = await User.findOneAndUpdate(
							{ _id: userId },
							{
								wsKey: "",
							},
							{ new: true },
						);
					} catch (error) {
						console.log(error);
						return res.status(401).json({ error });
					}
				});
			} catch (error) {
				console.log(error);
				return res.status(401).json({ error });
			}
			return res.status(200).json("Connection closed");
		},
	};

	const response = handleCase[method];

	if (response) response(req, res);
	else res.status(400).json({ error: "No response for this request" });
}
