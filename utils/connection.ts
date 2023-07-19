import mongoose from "mongoose";

const url = process.env.MONGODB_URI;

export const connect = async () => {
	await mongoose
		.connect(process.env.MONGODB_URI as string)
		.catch((err) => console.log(err));
};
