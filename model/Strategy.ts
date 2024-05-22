import mongoose from "mongoose";

const Schema = mongoose.Schema;

const strategySchema = new Schema({
	strategies: {
		type: [String],
	},
});
const Strategy =
	mongoose.models.Strategy || mongoose.model("Strategy", strategySchema);
export default Strategy;
