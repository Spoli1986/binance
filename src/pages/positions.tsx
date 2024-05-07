import { Inter } from "next/font/google";
import {
	FuturesAccountBalance,
	OrderResult,
	isWsFormattedKline,
	USDMClient,
	KlineInterval,
	WebsocketClient,
	DefaultLogger,
	OrderSide,
	FuturesOrderType,
	FuturesPosition,
	numberInString,
	IncomeHistory,
	FuturesPositionTrade,
	FuturesExchangeInfo,
} from "binance";
import { ReactNode, useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../layouts/mainLayout";
import { useExchangeInfo } from "../../utils/commonFunctions";
import { useSession } from "next-auth/react";
import Loading from "../../components/Loading";
import React from "react";
import { TAError } from "../../utils/types";

const inter = Inter({ subsets: ["latin"] });
type Balances = {
	usdtBalance: FuturesAccountBalance[];
	busdBalance: FuturesAccountBalance[];
};

type FilterType = {
	filterType: string;
	maxPrice: string;
	minPrice: string;
	tickSize: string;
};

type DataProps = {
	positions: FuturesPosition[];
	allAssetBalances: FuturesAccountBalance[];
	allOrders: OrderResult[];
	takeProfitOrders: {
		myPositions: FuturesPosition[];
		mySymbols: string[];
	};
	exchangeInfo: FuturesExchangeInfo;
};
const ignoredSillyLogMsgs = [
	"Sending ping",
	"Received pong, clearing pong timer",
	"Received ping, sending pong frame",
];

const INITIAL_DATA: Balances = {
	usdtBalance: [],
	busdBalance: [],
};

type SymbolPriceType = {
	E: number;
	P: string;
	T: number;
	e: number;
	i: string;
	p: string;
	r: string;
	s: string;
};

type MarkPriceType = Array<SymbolPriceType>;
const ORDER_DATA: OrderResult[] = [];
export default function Positions() {
	const [error, setError] = useState<TAError>();
	const [loading, setLoading] = useState<boolean>(false);
	const [balance, setBalance] = useState<Balances>(INITIAL_DATA);
	const [openorder, setOpenOrder] = useState(ORDER_DATA);
	const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
	const [positions, setPositions] = useState<FuturesPosition[]>([]);
	const [allSymbols, setAllSymbols] = useState<string[]>([]);
	let accMargin = 0;
	let unrealizedPnL = 0;

	const session = useSession();
	const userId = session.data?.user.id;
	useEffect(() => {
		startPriceSocket();
		setLoading(true);
	}, []);
	const startPriceSocket = async () => {
		try {
			const {
				positions,
				allAssetBalances,
				allOrders,
				takeProfitOrders,
				exchangeInfo,
			}: DataProps = (await axios.post("/api/getuserdatastream", { userId })).data;

			setBalance({
				busdBalance: allAssetBalances.filter((asset) => asset.asset === "BUSD"),
				usdtBalance: allAssetBalances.filter((asset) => asset.asset === "USDT"),
			});
			setOpenOrder(allOrders);
			setAllSymbols(takeProfitOrders.mySymbols);
			setPositions(takeProfitOrders.myPositions);
			setLoading(false);
		} catch (error: any) {
			console.log(error);
			setError({
				status: error.response.status,
				message: error.response.statusText,
			});
		}
	};
	return (
		<div className="w-full overflow-x-auto min-h-[calc(100vh-250px)] flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900">
			{session.status === "authenticated" && (
				<>
					{loading ? (
						<>
							<Loading />
							{error && (
								<div className="text-center text-2xl text-red-500 p-2 bg-red-100 animate-pulse rounded absolute">
									{error.message === "Bad Request" && (
										<p>
											Wrong API Key or Secret Key! <br />
											Contact the Admin!
										</p>
									)}
								</div>
							)}
						</>
					) : (
						<>
							<h1 className="text-3xl text-violet-500 font-bold underline my-10">
								Wallet
							</h1>
							<table className="p-10 text-green-400 text-2xl border border-white bg-blue-400/10">
								<thead className="pr-2">
									<tr className=" items-start">
										<th className="text-center w-52">Total free</th>
										<th className="text-center w-52">USDT</th>
										<th className="text-center w-52">BUSD</th>
									</tr>
								</thead>
								<tbody>
									<tr className="text-center">
										<td className="pr-2 ">
											{(
												Number(balance.usdtBalance[0]?.availableBalance) +
												Number(balance.busdBalance[0]?.availableBalance)
											).toFixed(2)}
										</td>

										<td className="pr-2">
											{Number(balance.usdtBalance[0]?.availableBalance).toFixed(2)}
										</td>

										<td className="pr-2">
											{Number(balance.busdBalance[0]?.availableBalance).toFixed(2)}
										</td>
									</tr>
								</tbody>
							</table>
							<h1 className="text-3xl text-violet-500 font-bold underline my-10">
								Open Orders
							</h1>
							{openorder.length ? (
								<div className="w-full sm:w-[95%] p-2 sm:p-7 overscroll-none">
									<div className="overflow-x-auto">
										<table className="w-full overscroll-x-none">
											<thead className="border-b-4 border-blue-400 text-white bg-gradient-to-r from-purple-800 via-violet-900 to-purple-800">
												<tr className="items-start">
													<th className="py-3 pl-4 text-start">Side</th>
													<th className="py-3 pl-4 text-start">Type</th>
													<th className="py-3 pl-4 text-start">Symbol</th>
													<th className="py-3 pl-4 text-start">Amount</th>
													<th className="py-3 pl-4 text-start">Price</th>
												</tr>
											</thead>
											<tbody className=" bg-gray-100 divide-y divide-gray-300">
												{openorder.map((order, index) => (
													<React.Fragment key={order.orderId}>
														<tr
															className={`${
																order.side === "SELL" ? "bg-red-500/75" : "bg-green-500/75"
															}`}
														>
															<td className="py-2 pl-4">{order.side}</td>
															<td className="py-2 pl-4">
																{order.origType === "TAKE_PROFIT"
																	? "TAKE PROFIT"
																	: "LIMIT ORDER"}
															</td>
															<td className="py-2 pl-4">{order.symbol}</td>
															<td className="py-2 pl-4">
																{order.origType === "LIMIT"
																	? (Number(order.origQty) * Number(order.price)).toFixed(2)
																	: "CLOSE POSITION"}
															</td>
															<td className="py-2 pl-4">
																${order.price ? order.price : order.stopPrice}
															</td>
														</tr>
														{index < openorder.length - 1 && (
															<tr className="h-2 bg-white/80"></tr>
														)}
													</React.Fragment>
												))}
											</tbody>
										</table>
									</div>
								</div>
							) : (
								<div className="text-slate-400">No open orders</div>
							)}
							<h1 className="text-3xl text-violet-500 font-bold underline my-10">
								Open Positions
							</h1>
							{positions.length ? (
								<div className="overflow-scroll w-full sm:w-[95%] p-2 sm:p-7 overscroll-x-none">
									<table className="w-full">
										<thead className="border-b-4 border-blue-400 w-full text-white bg-gradient-to-r from-purple-800 via-violet-900 to-purple-800">
											<tr className="items-start w-full">
												<th className="text-start">Side</th>
												<th className="text-start">Symbol</th>
												<th className="text-start">Open Since</th>
												<th className="text-start">Leverage</th>
												<th className="text-start">Entry Price</th>
												<th className="text-start">Liquid. Price</th>
												<th className="text-start">Margin Type</th>
												<th className="text-start">Market Price</th>
												<th className="text-start">Margin</th>
												<th className="text-start">Unrzld Profit</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-300">
											{positions.map((pos, index) => {
												accMargin += Number(pos.isolatedWallet);
												unrealizedPnL += Number(pos.unRealizedProfit);
												return (
													<React.Fragment key={pos.symbol}>
														<tr
															className={`${
																Number(pos.unRealizedProfit) < 0
																	? "bg-red-500/75"
																	: "bg-green-500/75"
															}`}
														>
															<td className="py-2 pl-4">
																{Number(pos.notional) < 0 ? "SHORT" : "LONG"}
															</td>
															<td className="py-2 pl-4">{pos.symbol}</td>
															<td className="py-2 pl-4">
																{new Date(pos.updateTime).toLocaleDateString()}
															</td>
															<td className="py-2 pl-4">{pos.leverage}</td>
															<td className="py-2 pl-4">
																${Number(pos.entryPrice).toFixed(3)}
															</td>
															<td className="py-2 pl-4">
																${Number(pos.liquidationPrice).toFixed(3)}
															</td>
															<td className="py-2 pl-4">{pos.marginType}</td>
															<td className="py-2 pl-4">
																${Number(pos.markPrice).toFixed(3)}
															</td>
															<td className="py-2 pl-4">
																${Number(pos.isolatedWallet).toFixed(3)}
															</td>
															<td className="py-2 pl-4">
																${Number(pos.unRealizedProfit).toFixed(3)} /{" "}
																{(
																	(Number(pos.unRealizedProfit) / Number(pos.isolatedWallet)) *
																	100
																).toFixed(3)}
																%
															</td>
														</tr>
														{index < openorder.length - 1 && (
															<tr className="h-2 bg-white/80"></tr>
														)}
													</React.Fragment>
												);
											})}
											<tr className="bg-none text-white text-xl">
												<td>Total:</td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td className="py-2 pl-4">${accMargin.toFixed(2)}</td>
												<td className="py-2 pl-4">
													${unrealizedPnL.toFixed(2)} /{" "}
													{((unrealizedPnL / accMargin) * 100).toFixed(2)}%
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							) : (
								<div className="text-slate-400">No open positions</div>
							)}
						</>
					)}
				</>
			)}
		</div>
	);
}

Positions.getLayout = (page: ReactNode) => <MainLayout>{page}</MainLayout>;
