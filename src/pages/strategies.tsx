import React, { ReactNode, useEffect, useState } from "react";
import MainLayout from "../../layouts/mainLayout";
import axios from "axios";
import { Autocomplete, Button, TextField } from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { connect } from "../../utils/connection";
import User from "../../model/User";
import { getSession } from "next-auth/react";
import { TUser, Strategies, TAError } from "../../utils/types";
import CustomizedAccordions from "../../components/Accordion";
import FourNHalf from "../../components/accordionDetails/FourFHalf";
import Aor from "../../components/accordionDetails/Aor";
import FiftyEighty from "../../components/accordionDetails/FiftyEighty";
import FiftyFifty from "../../components/accordionDetails/FiftyFifty";
import ThreeFiftyEighty from "../../components/accordionDetails/ThreeFiftyEighty";
import MaxForty from "../../components/accordionDetails/MaxForty";
import Loading from "../../components/Loading";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
type Props = { user: TUser; list: string[] };

export default function Positions({ user, list }: Props) {
	const [exchange, setExchange] = useState<string[]>(list);
	const [strategies, setStrategies] = useState<Strategies>(user.strategies);
	const [error, setError] = useState<TAError>();
	const [loading, setLoading] = useState<boolean>(false);

	function updateFields(fields: Strategies) {
		setStrategies((prev: any) => {
			return { ...prev, ...fields };
		});
	}

	const saveStrategies = async () => {
		try {
			setLoading(true);
			const response = await axios.put("/api/users/" + user._id, {
				strategies,
			});
			response.status === 200 && setLoading(false);
		} catch (error: any) {
			setLoading(false);
			setError({ status: error.response.status, message: error.response.message });
		}
	};

	return (
		<div className="w-full flex flex-col items-center bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900">
			<div className="bg-slate-200 flex flex-col my-24 md:w-3/5 xl:2/5 p-10 shadow-lg rounded-md border border-purple-900">
				<div className="flex flex-col">
					<form
						action=""
						onSubmit={saveStrategies}
						className="flex flex-col items-center gap-6 "
					>
						<div className="flex flex-col gap-4 p-3 border border-gray-500 rounded-md">
							<label className="font-semibold text-lg">4NHalf</label>
							<CustomizedAccordions>
								<FourNHalf />
							</CustomizedAccordions>
							<label className="font-semibold ">Add Asset(s)</label>

							<Autocomplete
								multiple
								id="checkboxes-tags-demo"
								options={exchange
									.map((symbol: string) => symbol)
									.sort((a: string, b: string) => {
										return a.toLowerCase().localeCompare(b.toLowerCase());
									})}
								value={strategies.fournhalf || ""}
								disableCloseOnSelect
								getOptionLabel={(option: any) => option}
								getOptionDisabled={(option) =>
									strategies.avalancheorrocket.includes(option)
								}
								renderOption={(props, option, { selected }) => {
									const isSelected = strategies.fournhalf
										? strategies.fournhalf.some((skill: string) => skill === option)
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
										fournhalf: newValue,
									});
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Assets"
										placeholder="...or start typing"
									/>
								)}
							/>
						</div>
						<div className="flex flex-col gap-4 p-3 border border-gray-500 rounded-md">
							<label className="font-semibold text-lg">Avalanche or Rocket</label>
							<CustomizedAccordions>
								<Aor />
							</CustomizedAccordions>
							<label className="font-semibold">Add Asset(s)</label>

							<Autocomplete
								multiple
								id="checkboxes-tags-demo"
								options={exchange
									.map((symbol: string) => symbol)
									.sort((a: string, b: string) => {
										return a.toLowerCase().localeCompare(b.toLowerCase());
									})}
								value={strategies.avalancheorrocket || []}
								disableCloseOnSelect
								getOptionLabel={(option: string) => option}
								getOptionDisabled={(option) => {
									const strategyArray = [
										...strategies.fournhalf,
										...strategies.fiftyeighty,
										...strategies.threefiftyeighty,
										...strategies.fiftyfifty,
										...strategies.maxforty,
									];
									return strategyArray.includes(option);
								}}
								renderOption={(props, option, { selected }) => {
									const isSelected = strategies.avalancheorrocket
										? strategies.avalancheorrocket.some((skill: any) => skill === option)
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
										avalancheorrocket: newValue,
									});
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Assets"
										placeholder="...or start typing"
									/>
								)}
							/>
						</div>
						<div className="flex flex-col gap-4 p-3 border border-gray-500 rounded-md">
							<label className="font-semibold text-lg">50/80</label>
							<CustomizedAccordions>
								<FiftyEighty />
							</CustomizedAccordions>
							<label className="font-semibold">Add Asset(s)</label>

							<Autocomplete
								multiple
								id="checkboxes-tags-demo"
								options={exchange
									.map((symbol: string) => symbol)
									.sort((a: string, b: string) => {
										return a.toLowerCase().localeCompare(b.toLowerCase());
									})}
								value={strategies.fiftyeighty || []}
								disableCloseOnSelect
								getOptionLabel={(option: string) => option}
								getOptionDisabled={(option) => {
									const strategyArray = [
										...strategies.fournhalf,
										...strategies.threefiftyeighty,
										...strategies.avalancheorrocket,
										...strategies.fiftyfifty,
										...strategies.maxforty,
									];
									return strategyArray.includes(option);
								}}
								renderOption={(props, option, { selected }) => {
									const isSelected = strategies.fiftyeighty
										? strategies.fiftyeighty.some((skill: any) => skill === option)
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
										fiftyeighty: newValue,
									});
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Assets"
										placeholder="...or start typing"
									/>
								)}
							/>
						</div>
						<div className="flex flex-col gap-4 p-3 border border-gray-500 rounded-md">
							<label className="font-semibold text-lg">50/50</label>
							<CustomizedAccordions>
								<FiftyFifty />
							</CustomizedAccordions>
							<label className="font-semibold">Add Asset(s)</label>

							<Autocomplete
								multiple
								id="checkboxes-tags-demo"
								options={exchange
									.map((symbol: string) => symbol)
									.sort((a: string, b: string) => {
										return a.toLowerCase().localeCompare(b.toLowerCase());
									})}
								value={strategies.fiftyfifty || []}
								disableCloseOnSelect
								getOptionLabel={(option: string) => option}
								getOptionDisabled={(option) => {
									const strategyArray = [
										...strategies.fournhalf,
										...strategies.fiftyeighty,
										...strategies.avalancheorrocket,
										...strategies.threefiftyeighty,
										...strategies.maxforty,
									];
									return strategyArray.includes(option);
								}}
								renderOption={(props, option, { selected }) => {
									const isSelected = strategies.fiftyfifty
										? strategies.fiftyfifty.some((skill: any) => skill === option)
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
										fiftyfifty: newValue,
									});
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Assets"
										placeholder="...or start typing"
									/>
								)}
							/>
						</div>
						<div className="flex flex-col gap-4 p-3 border border-gray-500 rounded-md">
							<label className="font-semibold text-lg">3-50/80</label>
							<CustomizedAccordions>
								<ThreeFiftyEighty />
							</CustomizedAccordions>
							<label className="font-semibold">Add Asset(s)</label>
							<Autocomplete
								multiple
								id="checkboxes-tags-demo"
								options={exchange
									.map((symbol: string) => symbol)
									.sort((a: string, b: string) => {
										return a.toLowerCase().localeCompare(b.toLowerCase());
									})}
								value={strategies.threefiftyeighty || []}
								disableCloseOnSelect
								getOptionLabel={(option: string) => option}
								getOptionDisabled={(option) => {
									const strategyArray = [
										...strategies.fournhalf,
										...strategies.fiftyeighty,
										...strategies.avalancheorrocket,
										...strategies.fiftyfifty,
										...strategies.maxforty,
									];
									return strategyArray.includes(option);
								}}
								renderOption={(props, option, { selected }) => {
									const isSelected = strategies.threefiftyeighty
										? strategies.threefiftyeighty.some((skill: any) => skill === option)
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
										threefiftyeighty: newValue,
									});
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Assets"
										placeholder="...or start typing"
									/>
								)}
							/>
						</div>
						<div className="flex flex-col gap-4 p-3 border border-gray-500 rounded-md">
							<label className="font-semibold text-lg">Max40</label>
							<CustomizedAccordions>
								<MaxForty />
							</CustomizedAccordions>
							<label className="font-semibold">Add Asset(s)</label>
							<Autocomplete
								multiple
								id="checkboxes-tags-demo"
								options={exchange
									.map((symbol: string) => symbol)
									.sort((a: string, b: string) => {
										return a.toLowerCase().localeCompare(b.toLowerCase());
									})}
								value={strategies.maxforty || []}
								disableCloseOnSelect
								getOptionLabel={(option: string) => option}
								getOptionDisabled={(option) => {
									const strategyArray = [
										...strategies.fournhalf,
										...strategies.fiftyeighty,
										...strategies.avalancheorrocket,
										...strategies.fiftyfifty,
										...strategies.threefiftyeighty,
									];
									return strategyArray.includes(option);
								}}
								renderOption={(props, option, { selected }) => {
									const isSelected = strategies.maxforty
										? strategies.maxforty.some((skill: any) => skill === option)
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
										maxforty: newValue,
									});
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Assets"
										placeholder="...or start typing"
									/>
								)}
							/>
						</div>
						{loading ? (
							<Loading type="button" />
						) : (
							<button
								role="button"
								className="bg-gradient-to-r from-purple-800 via-violet-900 to-purple-800 text-white w-[80px] h-14 uppercase self-center rounded-sm"
							>
								save
							</button>
						)}
					</form>
				</div>
			</div>
		</div>
	);
}

Positions.getLayout = (page: ReactNode) => <MainLayout>{page}</MainLayout>;

export async function getServerSideProps(ctx: any) {
	const session = await getSession(ctx);
	const userId = session?.user.id;
	await connect();
	if (session) {
		let user: any = await User.findById(userId).lean();
		user = { ...user, _id: userId };

		const response = await axios
			.get("https://fapi.binance.com/fapi/v1/exchangeInfo")
			.then((res) => res);
		const list = response.data.symbols.map((prec: any) => prec.symbol);

		return {
			props: { user, list },
		};
	} else
		return {
			props: { message: "nothing to show" },
		};
	// .map((user: any) => ({
	// 	...user,
	// 	id: user._id,
	// }));
}
