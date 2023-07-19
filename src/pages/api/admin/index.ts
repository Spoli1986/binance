import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../../../utils/connection";
import { ResponseFuncs } from "../../../../utils/types";
import Admin from "../../../../model/Admin";
import bcrypt from "bcrypt";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const method: keyof ResponseFuncs = req.method as keyof ResponseFuncs;

	const catcher = (error: Error) => res.status(400).json({ error });

	const handleCase: ResponseFuncs = {
		GET: async (req: NextApiRequest, res: NextApiResponse) => {
			await connect();
			res.json(await Admin.find().catch(catcher));
		},

		POST: async (req: NextApiRequest, res: NextApiResponse) => {
			await connect();
			try {
				const passwordToHash = req.body.password;
				const hashedPassword = await bcrypt.hash(passwordToHash, 10);
				const admin = await Admin.create({
					...req.body,
					...{ password: hashedPassword },
				});
				return res.json({
					message: "New admin has been successfully created!",
					status: "success",
					admin,
				});
			} catch (error) {
				return res.json({
					message: "No admin has been successfully created!",
					status: "failure",
				});
			}
		},
	};

	const response = handleCase[method];

	if (response) response(req, res);
	else res.status(400).json({ error: "No response for this request" });
};

export default handler;
