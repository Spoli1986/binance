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
	const [error, setError] = useState();
	const [balance, setBalance] = useState<Balances>(INITIAL_DATA);
	const [openorder, setOpenOrder] = useState(ORDER_DATA);
	const [symbol, setSymbol] = useState<string>("");
	const [price, SetPrice] = useState<number>();
	const [side, setSide] = useState<OrderSide>("BUY");
	const [type, setType] = useState<FuturesOrderType>("LIMIT");
	const [quantity, setQuantity] = useState<number>(0);
	const [exchangeInfo, setExchangeInfo] = useState<any>();

	const [markPrice, setMarkPrice] = useState<SymbolPriceType[]>([]);
	const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
	const [positions, setPositions] = useState<FuturesPosition[]>([]);
	const [allSymbols, setAllSymbols] = useState<string[]>([]);
	const [incomeHistory, setIncomeHistory] = useState<IncomeHistory[]>([]);
	const [accountTrades, setAccountTrades] = useState<FuturesPositionTrade[]>([]);
	const handleToggle = (orderId: number) => {
		if (selectedOrders.includes(orderId)) {
			setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
		} else {
			setSelectedOrders([...selectedOrders, orderId]);
		}
	};

	useEffect(() => {
		startPriceSocket();
		// axiosExchangeInfo();
	}, []);
	const startPriceSocket = async () => {
		const {
			positions,
			allAssetBalances,
			allOrders,
			takeProfitOrders,
			exchangeInfo,
		}: DataProps = (await axios.get("/api/getuserdatastream")).data;
		setBalance({
			busdBalance: allAssetBalances.filter((asset) => asset.asset === "BUSD"),
			usdtBalance: allAssetBalances.filter((asset) => asset.asset === "USDT"),
		});
		setOpenOrder(allOrders);
		setAllSymbols(takeProfitOrders.mySymbols);
		setPositions(takeProfitOrders.myPositions);
		// setExchangeInfo(exchangeInfo);
	};

	const startWebSocket = async () => {
		try {
			await axios.get("/api/binancews");
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center w-screen">
			<h1 className="text-3xl text-blue-800 font-bold underline my-10">Wallet</h1>
			<table className="p-10 text-green-400 text-2xl">
				<thead className="pr-2">
					<tr className=" items-start">
						<th className="text-start">Total free</th>
						<th className="text-start">USDT</th>
						<th className="text-start">BUSD</th>
					</tr>
				</thead>
				<tbody>
					<tr className="">
						<td className="pr-2">
							{Number(balance.usdtBalance[0]?.availableBalance) +
								Number(balance.busdBalance[0]?.availableBalance)}
						</td>

						<td className="pr-2">{balance.usdtBalance[0]?.availableBalance}</td>

						<td className="pr-2">{balance.busdBalance[0]?.availableBalance}</td>
					</tr>
				</tbody>
			</table>
			<div></div>
			<h1 className="text-3xl text-blue-800 font-bold underline my-10">
				Open Orders
			</h1>
			<div className="w-screen">
				{/* {openorder.map((order) => {
					return (
						<div key={order.orderId}>
							<div>{order.side}:</div>
							<div>
								{order.origQty}
								{order.symbol}@{order.price}
							</div>
						</div>
					);
				})} */}
				<table className="w-full">
					<thead className="border-b-4 border-blue-400">
						<tr className=" items-start">
							<th className="text-start">Side</th>
							<th className="text-start">Type</th>
							<th className="text-start">Symbol</th>
							<th className="text-start">Amount $</th>
							<th className="text-start">Price</th>
							<th className="text-start">Profit</th>
							<th className="text-start">Action</th>
						</tr>
					</thead>
					<tbody className="bg-slate-100 ">
						{openorder.map((order) => (
							<tr key={order.orderId} className="even:bg-white">
								<td>{order.side}</td>
								<td>
									{order.origType === "TAKE_PROFIT_MARKET"
										? "TAKE PROFIT"
										: "LIMIT ORDER"}
								</td>
								<td>{order.symbol}</td>
								<td>
									{order.origType === "LIMIT"
										? ((Number(order.origQty) * Number(order.price)) / 10).toFixed(2)
										: "CLOSE POSITION"}
								</td>
								<td>{!!order.price ? order.price : order.stopPrice}</td>
								<td>{!!order.stopPrice ? order.price : order.stopPrice}</td>
								<td>
									<button onClick={() => handleToggle(order.orderId)}>
										{selectedOrders.includes(order.orderId) ? "Hide" : "Show"}
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<h1 className="text-3xl text-blue-800 font-bold underline my-10">
				Open Positions
			</h1>
			<div className="overflow-scroll w-full">
				<table className="w-full">
					<thead className="border-b-4 border-blue-400 w-full">
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
					<tbody className="bg-slate-100">
						{positions.map((pos, index) => (
							<tr key={index} className="even:bg-white">
								<td>{Number(pos.notional) < 0 ? "SHORT" : "LONG"}</td>
								<td>{pos.symbol}</td>
								<td>{new Date(pos.updateTime).toLocaleDateString()}</td>
								<td>{pos.leverage}</td>
								<td>{Number(pos.entryPrice).toFixed(3)}</td>
								<td>{Number(pos.liquidationPrice).toFixed(3)}</td>
								<td>{pos.marginType}</td>
								<td>{Number(pos.markPrice).toFixed(3)}</td>
								<td>{Number(pos.isolatedWallet).toFixed(3)}</td>
								<td>
									{Number(pos.unRealizedProfit).toFixed(3)} /{" "}
									{(
										(Number(pos.unRealizedProfit) / Number(pos.isolatedWallet)) *
										100
									).toFixed(3)}
									%
								</td>
								{/* <td>
									<button onClick={() => handleToggle()}>
										{selectedOrders.includes(pos.orderId) ? "Hide" : "Show"}
									</button>
								</td> */}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<button
				onClick={startWebSocket}
				className="text-3xl text-red-500 py-2 px-4 border border-red-500 rounded-md hover:bg-red-500 hover:text-white font-bold my-10 transition-colors duration-200"
			>
				Start
			</button>
			<h1 className="text-3xl text-blue-800 font-bold underline my-10">
				New Order
			</h1>
			<form className="flex flex-col gap-3 w-2/5 text-black bg-slate-100 border border-slate-200 p-2 mb-10 rounded-md">
				<div className="flex flex-col p-1">
					<label htmlFor="symbol" className="text-gray-400 p-1">
						Symbol
					</label>
					<input
						type="text"
						placeholder="symbol"
						onChange={(e) => setSymbol(e.target.value)}
						className="h-10 rounded-md outline-none p-1 text-gray-600"
					/>
				</div>
				<div className="flex flex-col p-1">
					<label htmlFor="symbol" className="text-gray-400 p-1">
						Side
					</label>
					<select
						placeholder="side"
						onChange={(e) => console.log(e.target.value)}
						defaultValue={side}
						className="h-10 rounded-md outline-none p-1 text-gray-600"
					>
						<option value="BUY">BUY</option>
						<option value="SELL">SELL</option>
					</select>
				</div>
				<div className="flex flex-col p-1">
					<label htmlFor="symbol" className="text-gray-400 p-1">
						Type
					</label>
					<select
						name="type"
						id="2"
						placeholder="type"
						onChange={(e) => {
							setType(e.target.value as FuturesOrderType);
						}}
						className="h-10 rounded-md outline-none p-1 text-gray-600"
					>
						<option value="LIMIT">LIMIT</option>
						<option value="MARKET">MARKET</option>
						<option value="STOP">STOP</option>
						<option value="STOP_MARKET">STOP_MARKET</option>
						<option value="TAKE_PROFIT">TAKE_PROFIT</option>
						<option value="TAKE_PROFIT_MARKET">TAKE_PROFIT_MARKET</option>
						<option value="TRAILING_STOP_MARKET">TRAILING_STOP_MARKET</option>
					</select>
				</div>
				<div className="flex flex-col p-1">
					<label htmlFor="symbol" className="text-gray-400 p-1">
						Price
					</label>

					<input
						type="number"
						placeholder="price"
						onChange={(e) => SetPrice(Number(e.target.value))}
						className="h-10 rounded-md outline-none p-1 text-gray-600"
					/>
				</div>
				<div className="flex flex-col p-1">
					<label htmlFor="symbol" className="text-gray-400 p-1">
						Quantity
					</label>

					<input
						type="string"
						placeholder="quantity"
						onChange={(e) => setQuantity(Number(e.target.value))}
						className="h-10 rounded-md outline-none p-1 text-gray-600"
					/>
				</div>

				<input
					type="submit"
					title="submit"
					className="bg-white cursor-pointer w-max p-2 self-center rounded-lg hover:bg-green-600 hover:text-white active:bg-blue-600 active:text-white"
				/>
			</form>
		</div>
	);
}

Positions.getLayout = (page: ReactNode) => <MainLayout>{page}</MainLayout>;
