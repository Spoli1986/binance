import Image from "next/image";
import Chart from "../../public/assets/chart_threefiftyeighty.png";

export default function ThreeFiftyEighty() {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-col first-letter:mt-10">
				<h4 className="text-md font-semibold italic mb-2">Orders:</h4>
				<p>1 limit order 80%@-50%, 3 tp, no SL.</p>
				<table className="border-collapse border border-gray-300 mt-10">
					<thead>
						<tr>
							<th className="border p-3">TP</th>
							<th className="border p-3">Buy-on Limit Order</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="border p-3">25%@25% / 50%@50% / close@100%</td>
							<td className="border p-3">100%@-80%</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div className="flex flex-col mt-5">
				<h4 className="text-md font-semibold italic mb-2">When to use?</h4>
				<p>
					Similar to the 50/80 strategy, the distinction lies in the take profit
					approach. With each price reaching a take profit level, the position is
					incrementally reduced, lowering the buy-in quantity. Consequently, during a
					more substantial counter movement, a lesser balance is required to maintain
					the position.
				</p>

				<Image src={Chart} alt="chart" className="mt-10" />
			</div>
		</div>
	);
}
