import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../../../utils/connection";
import { ResponseFuncs } from "../../../../utils/types";
import User from "../../../../model/User";
import bcrypt from "bcrypt";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const method: keyof ResponseFuncs = req.method as keyof ResponseFuncs;

	const catcher = (error: Error) => res.status(400).json({ error });

	const handleCase: ResponseFuncs = {
		// GET: async (req: NextApiRequest, res: NextApiResponse) => {
		// 	res.status(200).json(await User.find({}).catch(catcher));
		// },

		POST: async (req: NextApiRequest, res: NextApiResponse) => {
			await connect();
			const passwordToHash = req.body.password;
			const hashedPassword = await bcrypt.hash(passwordToHash, 10);

			const user = await User.findOne({
				email: req.body.email,
			});

			if (user) {
				return res.status(400).json({
					message: "Email already registered!",
					status: "error",
				});
			}

			await User.create({ ...req.body, password: hashedPassword });
			return res.status(200).json({
				message: "Thank you for the registration, please check your email!",
				status: "success",
			});
		},
	};

	const response = handleCase[method];

	if (response) response(req, res);
	else res.status(400).json({ error: "No response for this request" });
};

export default handler;
