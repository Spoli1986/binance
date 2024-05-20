import axios from "axios";

type Props = {
	userId: string;
};

export default function WsStarter({ userId }: Props) {
	const startWebSocket = async () => {
		try {
			await axios.post("/api/openconnection", { userId });
		} catch (error) {
			console.log(error);
		}
	};
}
