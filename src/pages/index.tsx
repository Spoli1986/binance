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
} from "binance";
import { useEffect, useState } from "react";
import axios from "axios";

const inter = Inter({ subsets: ["latin"] });
type Balances = {
	usdtBalance: FuturesAccountBalance[];
	busdBalance: FuturesAccountBalance[];
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
export default function Home() {
	const [error, setError] = useState();
	const [balance, setBalance] = useState<Balances>(INITIAL_DATA);
	const [openorder, setOpenOrder] = useState(ORDER_DATA);
	const [symbol, setSymbol] = useState<string>("");
	const [price, SetPrice] = useState<number>();
	const [side, setSide] = useState<OrderSide>("BUY");
	const [type, setType] = useState<FuturesOrderType>("LIMIT");
	const [quantity, setQuantity] = useState<number>(0);
	const API_KEY = process.env.NEXT_PUBLIC_BINANCE_KEY;
	const API_SECRET = process.env.NEXT_PUBLIC_BINANCE_SECRET;
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
	const socketRootUrl = "/api/socketio";

	const logger = {
		...DefaultLogger,
		silly: (msg: any, context: any) => {
			if (ignoredSillyLogMsgs.includes(msg)) {
				return;
			}
			console.log(JSON.stringify({ msg, context }));
		},
	};
	const wsBianance = new WebsocketClient({
		api_key: API_KEY,
		api_secret: API_SECRET,
		beautify: true,
	});
	const getPrices = async () => {
		const response = await axios.get("/api/binancews").then((res) => res.data);
		const wsBinance = response.wsBinance;
		console.log(wsBinance);
		return wsBinance;
	};
	// useEffect(() => {
	// 	wsBianance.subscribeAllMarketMarkPrice("usdm", 3000);
	// 	wsBianance.on("message", (event: any) => {
	// 		const mySymbols = event.filter((e: any) => allSymbols.includes(e.s));
	// 		setMarkPrice(mySymbols);
	// 	});

	// }, []);

	const client = new USDMClient({
		api_key: API_KEY,
		api_secret: API_SECRET,
	});
	const startPriceSocket = async () => {
		const response = await axios.get("/api/binancews");
	};

	const makeOrder = async (e: any) => {
		e.preventDefault();
		console.log(symbol, side, type, quantity, price);
		try {
			const response = await client.submitNewOrder({
				symbol,
				side,
				type,
				quantity,
				price,
				timeInForce: "GTC",
			});
			console.log(response);
		} catch (error) {
			console.log(error);
		}
	};
	const closeOrder = async (e: any) => {
		e.preventDefault();
		try {
			const response = await client.cancelOrder({
				symbol,
			});
		} catch (error) {}
	};
	async function saveBalance() {
		await client
			.getBalance()
			.then((result) => {
				setBalance({
					busdBalance: result.filter((asset) => asset.asset === "BUSD"),
					usdtBalance: result.filter((asset) => asset.asset === "USDT"),
				});
			})
			.catch((err) => {
				console.error("getBalance error: ", err);
			});
	}

	async function getAccountTrades() {
		try {
			await client
				.getAccountTrades({ symbol: "GALAUSDT" })
				.then((res) => setAccountTrades(res));
		} catch (error) {
			console.log(error);
		}
	}
	async function GetIncomeHistory() {
		try {
			const incomeHistory = await client
				.getIncomeHistory({ incomeType: "REALIZED_PNL" })
				.then((res) => setIncomeHistory(res));
		} catch (error) {
			console.log(error);
		}
	}
	console.log(accountTrades);
	console.log(incomeHistory.filter((inc) => inc));
	async function getOrders() {
		await client
			.getAllOpenOrders()
			.then((result) => setOpenOrder(result))
			.catch((err) => {
				console.error("getOrders error: ", err);
			});
	}
	async function takeProfitOrders() {
		await client.getPositions().then((result) => {
			const myPositions = result.filter((val) => val.entryPrice !== "0.0");
			const mySymbols = myPositions.map((pos) => pos.symbol);
			setAllSymbols(mySymbols);
			setPositions(myPositions);
		});
	}

	useEffect(() => {
		saveBalance();
		getOrders();
		takeProfitOrders();
		getAccountTrades();
		GetIncomeHistory();
		// startPriceSocket();
	}, []);

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
			<h1 className="text-3xl text-blue-800 font-bold underline my-10">
				Current prices:
			</h1>
			<button onClick={getPrices}>Get Price</button>
			{/* {markPrice.map((obj, i) => {
				return (
					<p key={i}>
						{obj.s}: {obj.p}
					</p>
				);
			})} */}
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
			<h1 className="text-3xl text-blue-800 font-bold underline my-10">
				New Order
			</h1>
			<form
				onSubmit={makeOrder}
				className="flex flex-col gap-3 w-2/5 text-black bg-slate-100 border border-slate-200 p-2 mb-10 rounded-md"
			>
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
