import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../../../utils/connection";
import { ResponseFuncs } from "../../../../utils/types";
import User from "../../../../model/User";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const method: keyof ResponseFuncs = req.method as keyof ResponseFuncs;

	const catcher = (error: Error) => res.status(400).json({ error });

	const id: string | [] = req.query.id as string | [];

	const handleCase: ResponseFuncs = {
		GET: async (req: NextApiRequest, res: NextApiResponse) => {
			await connect();
			res.status(200).json(await User.findById(id).catch(catcher));
		},

		PUT: async (req: NextApiRequest, res: NextApiResponse) => {
			await connect();

			try {
				const user = await User.findByIdAndUpdate(
					id,
					{ strategies: req.body.strategies },
					{ new: true },
				);
				return res
					.status(200)
					.json({ message: "success", strategies: user.strategies });
			} catch (error) {
				error;
				return res.status(400).json({ message: "wrong", error });
			}
		},

		DELETE: async (req: NextApiRequest, res: NextApiResponse) => {
			await connect();
			/*
            let idArray : [] = []
            if(typeof id !== "string") id.map(ids => idArray.push(ids)),
            // {fullName: {$in:["User 1", "fwerfefv"]}}
            res.status(200).json(await User.deleteMany(idArray).catch(catcher));
            */
			res.status(200).json(await User.findByIdAndRemove(id).catch(catcher));
		},
	};

	const response = handleCase[method];
	if (response) response(req, res);
	else res.status(400).json({ error: "No Response for This Request" });
};

export default handler;
