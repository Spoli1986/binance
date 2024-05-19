import { NextApiRequest, NextApiResponse } from "next";
import { ResponseFuncs } from "../../../utils/types";
import { DefaultLogger, FuturesAccountBalance, USDMClient } from "binance";
import { getSession } from "next-auth/react";
import axios from "axios";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const catcher = (error: Error) => res.status(400).json({ error });

	const method: keyof ResponseFuncs = req.method as keyof ResponseFuncs;

	const handleCase: ResponseFuncs = {
		POST: async (req: NextApiRequest, res: NextApiResponse) => {
			const userId = req.body.userId;
			const session = await getSession({ req });
			let feeAmount: number = 0;
			if (session) {
				// const API_KEY = process.env[`NEXT_PUBLIC_BINANCE_KEY_ROLI`];
				// const API_SECRET = process.env[`NEXT_PUBLIC_BINANCE_SECRET_ROLI`];

				const API_KEY = process.env[`NEXT_PUBLIC_BINANCE_KEY_${userId}`];
				const API_SECRET = process.env[`NEXT_PUBLIC_BINANCE_SECRET_${userId}`];
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
				try {
					const client = new USDMClient({
						api_key: API_KEY,
						api_secret: API_SECRET,
					});
					const allOrders = await client.getAllOpenOrders().then((res) => res);

					const posAmt = await client
						.getIncomeHistory({ limit: 1000, incomeType: "REALIZED_PNL" })
						.then((res) => res.length);

					const commission = await client
						.getIncomeHistory({ limit: 1000, incomeType: "COMMISSION" })
						.then((res) =>
							res.reduce((total, obj) => {
								const incomeNumber = parseFloat(obj.income);
								if (!isNaN(incomeNumber)) {
									return total + incomeNumber;
								}
								// If conversion fails, ignore that income value
								return total;
							}, 0),
						);

					const pnl = await client
						.getIncomeHistory({
							limit: 1000,
							incomeType: "REALIZED_PNL",
						})
						.then((res) =>
							res.reduce((total, obj) => {
								const incomeNumber = parseFloat(obj.income);
								if (!isNaN(incomeNumber)) {
									return total + incomeNumber;
								}
								// If conversion fails, ignore that income value
								return total;
							}, 0),
						);

					const allAssetBalances = await client.getBalance().then((res) => {
						return res;
					});

					const takeProfitOrders = await client.getPositions().then((result) => {
						const myPositions = result.filter((val) => val.entryPrice !== "0.0");
						const mySymbols = myPositions.map((pos) => pos.symbol);
						return { myPositions, mySymbols };
					});

					return res.status(200).json({
						allAssetBalances,
						allOrders,
						takeProfitOrders,
						commission,
						posAmt,
						pnl,
					});
				} catch (error) {
					return res.status(400).json(error);
				}
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
