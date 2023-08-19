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

export function validateInsNumber(insNumber: string) {}

export async function mod9710(referenceString: string) {
	const baseNum = referenceString;
	const rf = "2715";
	const base = baseNum + rf + "00";
	const checkDigits = Number(BigInt(98) - (BigInt(base) % BigInt(97)));
	const validated = checkDigits > 9 ? checkDigits : "0" + checkDigits;

	return validated;
}

// export const createChannel = async (
// 	jobId: string,
// 	senderId: string,
// 	recipientId: string,
// ): Promise<ChannelsCreateResponse> => {
// 	const slackClient = new WebClient(
// 		"xoxp-5357186940051-5354368462325-5342886460103-b7ec4ce9e627adf5751bda33fcdee1aa",
// 	);

// 	// Create the channel
// 	const channelName = `job-channel-${jobId}`;
// 	const channelCreationResponse = (await slackClient.channels.create({
// 		name: channelName,
// 		is_private: true, // Make the channel private
// 	})) as ChannelsCreateResponse;

// 	// Add members to the channel
// 	await slackClient.channels.invite({
// 		channel: channelCreationResponse.channel?.id as string,
// 		user: senderId,
// 	});

// 	await slackClient.channels.invite({
// 		channel: channelCreationResponse.channel?.id as string,
// 		user: recipientId,
// 	});

// 	return channelCreationResponse;
// };

// AWS.config.update({
// 	region: process.env.S3region,
// 	accessKeyId: process.env.S3key,
// 	secretAccessKey: process.env.S3secret,
// 	signatureVersion: "v4",
// });

export const useIsMobile = (): boolean => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const userAgent = window.navigator.userAgent;
		const isMobileDevice = Boolean(
			userAgent.match(
				/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i,
			),
		);

		setIsMobile(isMobileDevice);
	}, []);

	return isMobile;
};

export const getToken = async () => {
	try {
		const response = await axios.post("/api/docusign/request-token");
		return response.data.token;
	} catch (error) {
		console.log("no token found", error);
	}
};

export async function createEnvelope(body: any, userId: string) {
	try {
		const response = await axios.post("/api/docusign/envelope", body);

		const link = response.data.url;
		const saveEnvelopeId = await axios.put("/api/users/freelancer/" + userId, {
			generalContractEnvelopeId: response.data.envelopeId,
		});
		return link;
	} catch (error) {
		console.log(error);
		return error;
	}
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
