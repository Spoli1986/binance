import mongoose from "mongoose";

const Schema = mongoose.Schema;

const wsKeySchema = new Schema({
	owner: {
		type: String,
		required: true,
	},
	wsKey: {
		type: String,
		required: true,
	},
});
const WsKey = mongoose.models.WsKey || mongoose.model("WsKey", wsKeySchema);
export default WsKey;
