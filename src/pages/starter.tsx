import React, { ReactNode } from "react";
import MainLayout from "../../layouts/mainLayout";
import { getSession, useSession } from "next-auth/react";
import { connect } from "../../utils/connection";
import User from "../../model/User";
import { TUser } from "../../utils/types";
import WsStarter from "../../components/WsHandlers/Starter";

type Props = { users: TUser[] };

export default function Starter({ users }: Props) {
	const session = useSession();

	if (session.data?.user.email !== "admin@spolarpeter.cc") {
		return <div>Unauthorized!</div>;
	} else
		return (
			<div className="h-[90vh] w-full border bg-blue-400 flex flex-col items-center">
				<div className="bg-white flex flex-col mt-24 w-1/2 p-10">
					{users.map((user) => (
						<WsStarter user={user} key={user._id} />
					))}
				</div>
			</div>
		);
}

Starter.getLayout = (page: ReactNode) => <MainLayout>{page}</MainLayout>;

export async function getServerSideProps(ctx: any) {
	const session = await getSession(ctx);
	const userId = session?.user.id;
	await connect();
	if (session) {
		let users: any = await User.find().lean();
		users = users.map((user: any) => {
			user._id = user._id.toString();
			return user;
		});

		return {
			props: { users },
		};
	} else
		return {
			props: { message: "nothing to show" },
		};
}
