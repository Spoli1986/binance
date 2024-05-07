import axios from "axios";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { getSession } from "next-auth/react";
import React, { ReactEventHandler, ReactNode, useState } from "react";
import MainLayout from "../../../layouts/mainLayout";
import User from "../../../model/User";
import { connect } from "../../../utils/connection";
import Link from "next/link";
import {
	Autocomplete,
	Box,
	Button,
	Modal,
	TextField,
	Typography,
} from "@mui/material";
import { TUser, iStrategies, TAError } from "../../../utils/types";
import Loading from "../../../components/Loading";
import CustomizedAccordions from "../../../components/Accordion";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
type Props = { user: TUser; list: string[] };
type TResponse = {
	message: string;
	strategies: iStrategies;
};

export default function Strategies({ user, list }: Props) {
	const [exchange, setExchange] = useState<string[]>(list);
	const [strategies, setStrategies] = useState<iStrategies>(user.strategies);
	const [open, setOpen] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [response, setResponse] = useState<TResponse>();
	const [error, setError] = useState<TAError>();

	function updateFields(fields: iStrategies) {
		setStrategies((prev: any) => {
			return { ...prev, ...fields };
		});
	}

	const saveStrategies = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			setLoading(true);
			const response = await axios.put("/api/users/" + user._id, {
				strategies,
			});
			response.status === 200 &&
				(setLoading(false),
				setResponse({
					message: response.data.message,
					strategies: response.data.strategies,
				}));
		} catch (error: any) {
			setLoading(false);
			setError({ status: error.response.status, message: error.response.message });
		}
	};

	const handleOpen = (e: any) => {
		e.preventDefault;
		setOpen(true);
	};
	return (
		<div className="w-full overflow-x-auto min-h-[calc(100vh-250px)] flex flex-col items-center bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900 gap-20">
			<div className=" bg-white/90 gap-5 flex flex-col my-24 w-[90%] md:w-3/5 p-5 rounded-md border border-purple-900">
				{/* <h1 className="text-2xl sm:text-4xl font-mortal text-red-600 uppercase animate-pulse mb-5">
					Choose your destiny...
				</h1> */}
				<form
					action=""
					onSubmit={(e) => saveStrategies(e)}
					className="flex flex-col items-center gap-6"
				>
					<div className="flex flex-col gap-4 p-3 border border-gray-500 rounded-md w-full">
						<Link
							href={"/strategies/fournhalf"}
							className="hover:text-red-600 text-xl sm:text-2xl text-violet-600 rounded w-max"
						>
							4NHalf
						</Link>
						<label className="font-semibold text-lg ">4NHalf (25X ONLY!!!)</label>

						<Autocomplete
							multiple
							id="checkboxes-tags-demo"
							options={exchange
								.map((symbol: string) => symbol)
								.sort((a: string, b: string) => {
									return a.toLowerCase().localeCompare(b.toLowerCase());
								})}
							value={strategies.fournhalf || []}
							disableCloseOnSelect
							getOptionLabel={(option: any) => option}
							getOptionDisabled={(option) => {
								const strategyArray = [
									...strategies.fournhalftwenty,
									...strategies.fiftyeighty,
									...strategies.threefiftyeighty,
									...strategies.fiftyfifty,
									...strategies.maxforty,
									...strategies.maxfortytenr,
									...strategies.maxeight,
								];
								return strategyArray.includes(option);
							}}
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
						<label className="font-semibold text-lg ">4NHalf20 (20X ONLY!!!)</label>

						<Autocomplete
							multiple
							id="checkboxes-tags-demo"
							options={exchange
								.map((symbol: string) => symbol)
								.sort((a: string, b: string) => {
									return a.toLowerCase().localeCompare(b.toLowerCase());
								})}
							value={strategies.fournhalftwenty || []}
							disableCloseOnSelect
							getOptionLabel={(option: any) => option}
							getOptionDisabled={(option) => {
								const strategyArray = [
									...strategies.fournhalf,
									...strategies.fiftyeighty,
									...strategies.threefiftyeighty,
									...strategies.fiftyfifty,
									...strategies.maxforty,
									...strategies.maxfortytenr,
									...strategies.maxeight,
								];
								return strategyArray.includes(option);
							}}
							renderOption={(props, option, { selected }) => {
								const isSelected = strategies.fournhalftwenty
									? strategies.fournhalftwenty.some((skill: string) => skill === option)
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
									fournhalftwenty: newValue,
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
					<div className="flex flex-col gap-4 p-3 border border-gray-500 rounded-md w-full">
						<Link
							href={"/strategies/avalancheorrocket"}
							className="hover:text-red-600 text-xl sm:text-2xl text-violet-600 rounded w-max"
						>
							Avalanche or Rocket
						</Link>
						<label className="font-semibold text-lg">Avalanche or Rocket</label>
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
									...strategies.maxfortytenr,
									...strategies.avalancheorrocketreverse,
									...strategies.maxeight,
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
						<label className="font-semibold text-lg">
							Avalanche or Rocket Reverse
						</label>
						<Autocomplete
							multiple
							id="checkboxes-tags-demo"
							options={exchange
								.map((symbol: string) => symbol)
								.sort((a: string, b: string) => {
									return a.toLowerCase().localeCompare(b.toLowerCase());
								})}
							value={strategies.avalancheorrocketreverse || []}
							disableCloseOnSelect
							getOptionLabel={(option: string) => option}
							getOptionDisabled={(option) => {
								const strategyArray = [
									...strategies.fournhalf,
									...strategies.fiftyeighty,
									...strategies.threefiftyeighty,
									...strategies.fiftyfifty,
									...strategies.maxforty,
									...strategies.maxfortytenr,
									...strategies.avalancheorrocket,
									...strategies.maxeight,
								];
								return strategyArray.includes(option);
							}}
							renderOption={(props, option, { selected }) => {
								const isSelected = strategies.avalancheorrocketreverse
									? strategies.avalancheorrocketreverse.some(
											(skill: any) => skill === option,
									  )
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
									avalancheorrocketreverse: newValue,
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
					<div className="flex flex-col gap-4 p-3 border border-gray-500 rounded-md w-full">
						<Link
							href={"/strategies/fiftyeighty"}
							className="hover:text-red-600 text-xl sm:text-2xl text-violet-600 rounded w-max"
						>
							50/80
						</Link>
						<label className="font-semibold text-lg">50/80</label>

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
									...strategies.avalancheorrocketreverse,
									...strategies.fiftyfifty,
									...strategies.maxforty,
									...strategies.maxfortytenr,
									...strategies.maxeight,
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
					<div className="flex flex-col gap-4 p-3 border border-gray-500 rounded-md w-full">
						<Link
							href={"/strategies/fiftyfifty"}
							className="hover:text-red-600 text-xl sm:text-2xl text-violet-600 rounded w-max"
						>
							50/50
						</Link>
						<label className="font-semibold text-lg">50/50</label>

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
									...strategies.avalancheorrocketreverse,
									...strategies.threefiftyeighty,
									...strategies.maxforty,
									...strategies.maxfortytenr,
									...strategies.maxeight,
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
					<div className="flex flex-col gap-4 p-3 border border-gray-500 rounded-md w-full">
						<Link
							href={"/strategies/threefiftyeighty"}
							className="hover:text-red-600 text-xl sm:text-2xl text-violet-600 rounded w-max"
						>
							3-50/80
						</Link>
						<label className="font-semibold text-lg">3-50/80</label>
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
									...strategies.avalancheorrocketreverse,
									...strategies.fiftyfifty,
									...strategies.maxforty,
									...strategies.maxfortytenr,
									...strategies.maxeight,
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
					<div className="flex flex-col gap-4 p-3 border border-gray-500 rounded-md w-full">
						<Link
							href={"/strategies/maxfourty"}
							className="hover:text-red-600 text-xl sm:text-2xl text-violet-600 rounded w-max"
						>
							Max
						</Link>
						<label className="font-semibold text-lg">Max40</label>
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
									...strategies.avalancheorrocketreverse,
									...strategies.fiftyfifty,
									...strategies.threefiftyeighty,
									...strategies.maxfortytenr,
									...strategies.maxeight,
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
						<label className="font-semibold text-lg">Max40-10R</label>
						<Autocomplete
							multiple
							id="checkboxes-tags-demo"
							options={exchange
								.map((symbol: string) => symbol)
								.sort((a: string, b: string) => {
									return a.toLowerCase().localeCompare(b.toLowerCase());
								})}
							value={strategies.maxfortytenr || []}
							disableCloseOnSelect
							getOptionLabel={(option: string) => option}
							getOptionDisabled={(option) => {
								const strategyArray = [
									...strategies.fournhalf,
									...strategies.fiftyeighty,
									...strategies.avalancheorrocket,
									...strategies.avalancheorrocketreverse,
									...strategies.fiftyfifty,
									...strategies.threefiftyeighty,
									...strategies.maxforty,
									...strategies.maxeight,
								];
								return strategyArray.includes(option);
							}}
							renderOption={(props, option, { selected }) => {
								const isSelected = strategies.maxfortytenr
									? strategies.maxfortytenr.some((skill: any) => skill === option)
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
									maxfortytenr: newValue,
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
						<label className="font-semibold text-lg">Max8</label>
						<Autocomplete
							multiple
							id="checkboxes-tags-demo"
							options={exchange
								.map((symbol: string) => symbol)
								.sort((a: string, b: string) => {
									return a.toLowerCase().localeCompare(b.toLowerCase());
								})}
							value={strategies.maxeight || []}
							disableCloseOnSelect
							getOptionLabel={(option: string) => option}
							getOptionDisabled={(option) => {
								const strategyArray = [
									...strategies.fournhalf,
									...strategies.fiftyeighty,
									...strategies.avalancheorrocket,
									...strategies.avalancheorrocketreverse,
									...strategies.fiftyfifty,
									...strategies.threefiftyeighty,
									...strategies.maxforty,
									...strategies.maxfortytenr,
								];
								return strategyArray.includes(option);
							}}
							renderOption={(props, option, { selected }) => {
								const isSelected = strategies.maxeight
									? strategies.maxeight.some((skill: any) => skill === option)
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
									maxeight: newValue,
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
						<label className="font-semibold text-lg">Turboreverse</label>
						<Autocomplete
							multiple
							id="checkboxes-tags-demo"
							options={exchange
								.map((symbol: string) => symbol)
								.sort((a: string, b: string) => {
									return a.toLowerCase().localeCompare(b.toLowerCase());
								})}
							value={strategies.turboreverse || []}
							disableCloseOnSelect
							getOptionLabel={(option: string) => option}
							getOptionDisabled={(option) => {
								const strategyArray = [
									...strategies.fournhalf,
									...strategies.fiftyeighty,
									...strategies.avalancheorrocket,
									...strategies.avalancheorrocketreverse,
									...strategies.fiftyfifty,
									...strategies.threefiftyeighty,
									...strategies.maxforty,
									...strategies.maxfortytenr,
								];
								return strategyArray.includes(option);
							}}
							renderOption={(props, option, { selected }) => {
								const isSelected = strategies.turboreverse
									? strategies.turboreverse.some((skill: any) => skill === option)
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
									turboreverse: newValue,
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
	);
}

Strategies.getLayout = (page: ReactNode) => <MainLayout>{page}</MainLayout>;

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
