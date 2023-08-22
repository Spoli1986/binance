import Image from "next/image";
import Chart from "../../public/assets/chart_4nhalf.png";

export default function MaxForty() {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-col first-letter:mt-10">
				<h4 className="text-md font-semibold italic mb-2">Orders:</h4>
				<p>
					1 limit order 50%@-50%, 2 tp 50%@25% & close%@40%, position margin &gt; $40
					SL@50%.
				</p>
				<table className="border-collapse border border-gray-300 mt-10">
					<thead>
						<tr>
							<th className="border p-3">TP</th>
							<th className="border p-3">Buy-on Limit Order</th>
							<th className="border p-3">SL</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="border p-3">50%@25% / close@40%</td>
							<td className="border p-3">-50%</td>
							<td className="border p-3">-50%</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div className="flex flex-col mt-5">
				<h4 className="text-md font-semibold italic mb-2">When to use?</h4>
				<p>
					A stringent strategy with controlled losses. If the margin surpasses the
					$40 limit, a stop-loss order will be triggered at a -50% profit and loss
					(PNL) instead of a limit order.
				</p>

				<Image src={Chart} alt="chart" className="mt-10" />
			</div>
		</div>
	);
}
