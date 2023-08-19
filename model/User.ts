import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		type: "string",
		required: true,
	},
	password: {
		type: "string",
		required: true,
	},
	confirmed: {
		type: "boolean",
	},
});
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
