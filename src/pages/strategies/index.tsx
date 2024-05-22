import axios from "axios";
import { getSession } from "next-auth/react";
import React, { ReactNode, useState } from "react";
import MainLayout from "../../../layouts/mainLayout";
import User from "../../../model/User";
import { connect } from "../../../utils/connection";
import { TUser, iStrategies, TAError } from "../../../utils/types";
import Loading from "../../../components/Loading";
import StrategySelector from "../../../components/Strategies/StrategySelector";
import Strategy from "../../../model/Strategy";

type Props = { user: TUser; symbolList: string[]; strategyDefs: string[] };
type TResponse = {
	message: string;
	strategies: iStrategies;
};

export default function Strategies({ user, symbolList, strategyDefs }: Props) {
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
						{strategyDefs.map((strategy) => (
							<StrategySelector
								key={strategy}
								updateFields={updateFields}
								allStrategies={strategies}
								exchange={symbolList}
								strategyDefs={strategyDefs}
								currentStrategy={strategy}
							/>
						))}
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

		let strategyDefs: any = await Strategy.find().lean();

		strategyDefs = strategyDefs[0].strategies;

		const response = await axios
			.get("https://fapi.binance.com/fapi/v1/exchangeInfo")
			.then((res) => res);
		const symbolList = response.data.symbols.map((prec: any) => prec.symbol);

		return {
			props: { user, symbolList, strategyDefs },
		};
	} else
		return {
			props: { message: "nothing to show" },
		};
}
