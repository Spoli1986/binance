import Image from "next/image";
import Chart from "../../public/assets/chart_4nhalf.png";

const priceDistancePercentage: number[] = [0.0072, 0.0136, 0.02, 0.0256, 0.04];
const buyInMultiplier: number[] = [2.5, 3.75, 4.5, 5.85, 14.625];

export default function FourNHalf() {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-col first-letter:mt-10">
				<h4 className="text-md font-semibold italic mb-2">Orders:</h4>
				<p>5 limit orders, 1 tp 100%@35%, SL@-4.5%. Avg. lifetime 11hrs.</p>
				<table className="border-collapse border border-gray-300 mt-10">
					<thead>
						<tr>
							<th className="border p-3"></th>
							<th className="border p-3">Price Distance Percentage</th>
							<th className="border p-3">Buy In Multiplier</th>
						</tr>
					</thead>
					<tbody>
						{priceDistancePercentage.map((percentage, index) => (
							<tr key={index}>
								<td className="border p-3 font-semibold">B{index + 1}</td>
								<td className="border p-3">{(percentage * 100).toFixed(2)}%</td>
								<td className="border p-3">{buyInMultiplier[index]}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="flex flex-col mt-5">
				<h4 className="text-md font-semibold italic mb-2">When to use?</h4>
				<p>
					Following a substantial movement, the price enters a consolidation phase
					within a 4.5% range. Typically, a counter movement is anticipated. The
					strategy requires only a 1.3% improvement from the entry price.
				</p>

				<Image src={Chart} alt="chart" className="mt-10" />
			</div>
		</div>
	);
}
