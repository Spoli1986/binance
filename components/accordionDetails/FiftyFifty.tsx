import Image from "next/image";
import Chart from "../../public/assets/chart_fiftyfifty.png";

export default function FiftyFifty() {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-col first-letter:mt-10">
				<h4 className="text-md font-semibold italic mb-2">Orders:</h4>
				<p>1 limit order 50%@-50%, 1 tp 100%@50%, no SL.</p>
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
							<td className="border p-3">50%@-50%</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div className="flex flex-col mt-5">
				<h4 className="text-md font-semibold italic mb-2">When to use?</h4>
				<p>
					Open-ended strategy: Employed when the price direction is uncertain, yet
					the asset displays moderate volatility. In this approach, a position can be
					initiated in either direction. Through one or more strategic buy-ins, the
					entry can be optimized to work in our favor.
				</p>

				<Image src={Chart} alt="chart" className="mt-10" />
			</div>
		</div>
	);
}
