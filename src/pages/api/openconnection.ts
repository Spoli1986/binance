import type { NextApiRequest, NextApiResponse } from "next";
import { ResponseFuncs } from "../../../utils/types";
import { WebsocketClient } from "binance";
import WsKey from "../../../model/WsKey";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const method: keyof ResponseFuncs = req.method as keyof ResponseFuncs;

	const name: string = req.body.name;

	const API_KEY = process.env.NEXT_PUBLIC_BINANCE_KEY + name;
	const API_SECRET = process.env.NEXT_PUBLIC_BINANCE_SECRET + name;

	const handleCase: ResponseFuncs = {
		POST: async (req: NextApiRequest, res: NextApiResponse) => {
			const wsBinance = new WebsocketClient({
				api_key: API_KEY,
				api_secret: API_SECRET,
				beautify: true,
			});

			wsBinance.subscribeUsdFuturesUserDataStream(false, true);

			wsBinance.on("open", async (event) => {
				try {
					console.log("opened");
					await WsKey.findOneAndUpdate({ owner: name }, { wsKey: event.wsKey });
				} catch (error) {}
			});
		},
	};

	const response = handleCase[method];

	if (response) response(req, res);
	else res.status(400).json({ error: "No response for this request" });
}
