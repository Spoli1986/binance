import { Autocomplete, TextField } from "@mui/material";
import { iStrategies, TStrategyDefs } from "../../utils/types";
import { useState } from "react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Checkbox from "@mui/material/Checkbox";

type StrategySelectorProps = {
	strategyDefs: string[];
	currentStrategy: string;
	allStrategies: iStrategies;
	exchange: string[];
	updateFields: (fields: iStrategies) => void;
};

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function StrategySelector({
	currentStrategy,
	allStrategies,
	exchange,
	strategyDefs,
	updateFields,
}: StrategySelectorProps) {
	const [strategies, setStrategies] = useState<iStrategies>(allStrategies);

	return (
		<>
			<label className="font-semibold text-lg ">{currentStrategy}</label>

			<Autocomplete
				multiple
				id="checkboxes-tags-demo"
				options={exchange
					.map((symbol: string) => symbol)
					.sort((a: string, b: string) => {
						return a.toLowerCase().localeCompare(b.toLowerCase());
					})}
				value={allStrategies[currentStrategy] || []}
				disableCloseOnSelect
				getOptionLabel={(option: any) => option}
				getOptionDisabled={(option) => {
					const strategyArray = strategyDefs.reduce<string[]>((acc, strategy) => {
						if (strategy !== currentStrategy) {
							return acc.concat(allStrategies[strategy]);
						}
						return acc;
					}, []);
					return strategyArray.includes(option);
				}}
				renderOption={(props, option, { selected }) => {
					const isSelected = allStrategies[currentStrategy]
						? allStrategies[currentStrategy].some((skill: string) => skill === option)
						: selected;

					return (
						<li {...props}>
							<Checkbox
								icon={icon}
								checkedIcon={checkedIcon}
								style={{ marginRight: 8 }}
								checked={isSelected}
							/>
							{option}
						</li>
					);
				}}
				onChange={(event, newValue) => {
					updateFields({
						[currentStrategy]: newValue,
					});
				}}
				renderInput={(params) => (
					<TextField {...params} label="Assets" placeholder="...or start typing" />
				)}
			/>
		</>
	);
}
