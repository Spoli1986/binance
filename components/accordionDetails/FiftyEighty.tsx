import Image from "next/image";
import Chart from "../../public/assets/chart_fiftyeighty.png";

export default function FiftyEighty() {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-col first-letter:mt-10">
				<h4 className="text-md font-semibold italic mb-2">Orders:</h4>
				<p>1 limit order 100%@-80%, 1 tp 100%@50%, no SL.</p>
				<table className="border-collapse border border-gray-300 mt-10">
					<thead>
						<tr>
							<th className="border p-3">TP</th>
							<th className="border p-3">Buy-on Limit Order</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="border p-3">50%</td>
							<td className="border p-3">-80%</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div className="flex flex-col mt-5">
				<h4 className="text-md font-semibold italic mb-2">When to use?</h4>
				<p>
					An open-ended strategy is employed when the price direction is unclear, yet
					the asset experiences significant volatility. In this scenario, a position
					can be initiated in either direction. With one or more buy-ins, the entry
					can be strategically timed to our advantage.
				</p>

				<Image src={Chart} alt="chart" className="mt-10" />
			</div>
		</div>
	);
}
