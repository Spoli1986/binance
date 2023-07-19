import mongoose from "mongoose";

const Schema = mongoose.Schema;

const adminSchema = new Schema({
	email: {
		type: "string",
		required: true,
	},
	password: {
		type: "string",
		required: true,
	},
	role: {
		type: "string",
		required: true,
		defaultsTo: "admin",
	},
});
const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
export default Admin;
