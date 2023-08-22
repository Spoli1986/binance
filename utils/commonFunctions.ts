import axios from "axios";
import { useEffect, useState } from "react";

export function useShowCreateInvoiceForm() {
	const [showForm, setShowForm] = useState(false);

	function hide() {
		setShowForm(false);
	}
	function open() {
		setShowForm(true);
	}
	return { hide, open, showForm };
}

export function useShowCreateClientForm() {
	const [showForm, setShowForm] = useState(false);

	function changeState(newState: boolean) {
		setShowForm(newState);
	}
	return { showForm, changeState };
}

export async function useCountries() {
	let countryList: any;
	const response = await fetch("/api/countries", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	})
		.then((res) => res.json())
		.then(function (countries) {
			countryList = countries;
		});
	return countryList;
}

export async function uploadFileToS3(url: any, file: any) {
	let { data } = await axios.put(url, file, {
		headers: {
			"Content-type": file.type,
			"Access-Control-Allow-Origin": "*",
		},
	});

	return { message: "success", data };
}

export const useValidator = () => {
	const nameValidator = (name: string): boolean => {
		const regex = /^[A-Z\u00C0-\u017F][a-zA-Z\u00C0-\u017F]*$/;

		const isValid = regex.test(name);
		return isValid;
	};

	const emailValidator = (email: string): boolean => {
		const regexValidator = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const isValid = regexValidator.test(email);
		return isValid;
	};

	const passwordValidator = (password: string): boolean => {
		const regexValidator = /(?=.*[A-Z])(?=.*\d)(?=.*\W)(?!.* ).{8,}/;
		const isValid = regexValidator.test(password);
		return isValid;
	};

	return { nameValidator, emailValidator, passwordValidator };
};

export async function useExchangeInfo(symbol: string) {
	const precisions = await axios
		.get("https://fapi.binance.com/fapi/v1/exchangeInfo")
		.then((res) => {
			const symbolInfoArray = res.data.symbols.filter(
				(sym: any) => sym.symbol === symbol,
			);
			const tickSize =
				symbolInfoArray[0]["filters"]
					.filter((filter: any) => filter.filterType === "PRICE_FILTER")[0]
					.tickSize.split(".")
					.pop()
					.indexOf("1") + 1;
			const stepSize = symbolInfoArray[0]["filters"].filter(
				(filter: any) => filter.filterType === "LOT_SIZE",
			)[0];

			const place =
				Number(stepSize.stepSize) < 1
					? stepSize.stepSize.split(".").pop().indexOf("1") + 1
					: 0;
			return [tickSize, place];
		});
	return precisions;
}
