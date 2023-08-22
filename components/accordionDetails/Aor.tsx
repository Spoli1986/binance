import Image from "next/image";
import Chart from "../../public/assets/chart_aor.png";

export default function Aor() {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-col first-letter:mt-10">
				<h4 className="text-md font-semibold italic mb-2">Orders:</h4>
				<p>No limit orders, 1 tp 100%@350%, SL@-50%.</p>
				<table className="border-collapse border border-gray-300 mt-10">
					<thead>
						<tr>
							<th className="border p-3">TP</th>
							<th className="border p-3">SL</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="border p-3">350%</td>
							<td className="border p-3">-50%</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div className="flex flex-col mt-5">
				<h4 className="text-md font-semibold italic mb-2">When to use?</h4>
				<p>
					When the price consolidates for an extended period and a larger movement is
					anticipated.
				</p>
				<p>
					When the asset exhibits a clear trend after experiencing a pullback or a
					fake-out.
				</p>

				<Image src={Chart} alt="chart" className="mt-10" />
			</div>
		</div>
	);
}
