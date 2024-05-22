import axios from "axios";
import { TUser } from "../../utils/types";

type Props = {
	user: TUser;
};

export default function WsStarter({ user }: Props) {
	const startWebSocket = async (user: TUser) => {
		try {
			await axios.post("/api/openconnection", { user });
		} catch (error) {
			console.log(error);
		}
	};
	const closeWebSocket = async (userId: string) => {
		try {
			await axios.post("/api/closeconnection", { userId });
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<button
			onClick={() => startWebSocket(user)}
			className={`text-3xl ${
				user.isOpenConnection
					? "text-green-500 border-green-500 hover:bg-red-500"
					: "text-gray-400 border-gray-400 hover:bg-green-500"
			} rounded-md px-4 py-2 border hover:text-white font-bold my-10 transition-colors duration-200`}
		>
			Start {user.email}
		</button>
	);
}
