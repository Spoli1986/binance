import React, { ReactNode } from "react";
import MainLayout from "../../layouts/mainLayout";
import axios from "axios";
import { useSession } from "next-auth/react";

type Props = {};

export default function Starter({}: Props) {
	const session = useSession();
	console.log(session.data?.user.email);
	if (session.data?.user.email !== "admin@spolarpeter.cc") {
		return <div>Unauthorized!</div>;
	} else {
		const userId = session.data.user.id;
		const startWebSocketPeti = async () => {
			try {
				await axios.post("/api/openconnection", { userId: userId });
			} catch (error) {
				console.log(error);
			}
		};

		const startWebSocketLevi = async () => {
			try {
				await axios.post("/api/openconnection", {
					userId: "64e5e6be11510fbafbffd0b0",
				});
			} catch (error) {
				console.log(error);
			}
		};

		const startWebSocketRoli = async () => {
			try {
				await axios.post("/api/roli", { userId: {} });
			} catch (error) {
				console.log(error);
			}
		};
		const startWebSocketKPeti = async () => {
			try {
				await axios.post("/api/openconnection", {
					userId: "64e5c4178b880db33ac77622",
				});
			} catch (error) {
				console.log(error);
			}
		};
		const startWebSocketAttila = async () => {
			try {
				await axios.post("/api/openconnection", {
					userId: "64e5f408f536ed080e34d9b1",
				});
			} catch (error) {
				console.log(error);
			}
		};

		return (
			<div className="h-[90vh] w-full border bg-blue-400 flex flex-col items-center">
				<div className="bg-white flex flex-col mt-24 w-1/2 p-10">
					<button
						onClick={startWebSocketPeti}
						className="text-3xl text-green-500 py-2 px-4 border border-green-500 rounded-md hover:bg-green-500 hover:text-white font-bold my-10 transition-colors duration-200"
					>
						Start Peti
					</button>
					<button
						onClick={startWebSocketLevi}
						className="text-3xl text-green-500 py-2 px-4 border border-green-500 rounded-md hover:bg-green-500 hover:text-white font-bold my-10 transition-colors duration-200"
					>
						Start Levi
					</button>
					<button
						onClick={startWebSocketRoli}
						className="text-3xl text-green-500 py-2 px-4 border border-green-500 rounded-md hover:bg-green-500 hover:text-white font-bold my-10 transition-colors duration-200"
					>
						Start Roli
					</button>
					<button
						onClick={startWebSocketKPeti}
						className="text-3xl text-green-500 py-2 px-4 border border-green-500 rounded-md hover:bg-green-500 hover:text-white font-bold my-10 transition-colors duration-200"
					>
						Start K Peti
					</button>
					<button
						onClick={startWebSocketAttila}
						className="text-3xl text-green-500 py-2 px-4 border border-green-500 rounded-md hover:bg-green-500 hover:text-white font-bold my-10 transition-colors duration-200"
					>
						Start Attila
					</button>
				</div>
			</div>
		);
	}
}

Starter.getLayout = (page: ReactNode) => <MainLayout>{page}</MainLayout>;
