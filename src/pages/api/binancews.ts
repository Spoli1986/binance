import type { NextApiRequest, NextApiResponse } from "next";
import { ResponseFuncs } from "../../../utils/types";

export const config = {
	api: {
		externalResolver: true,
	},
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const catcher = (error: Error) => res.status(400).json({ error });

	const method: keyof ResponseFuncs = req.method as keyof ResponseFuncs;

	const handleCase: ResponseFuncs = {
		GET: async (req: NextApiRequest, res: NextApiResponse) => {},
	};
	const response = handleCase[method];

	if (response) response(req, res);
	else res.status(400).json({ error: "No response for this request" });
}
