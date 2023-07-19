import React from "react";
import { signOut, useSession } from "next-auth/react";

type Props = {};

function Header({}: Props) {
	const signout = () => {
		signOut({ callbackUrl: "/" });
	};
	return (
		<div
			className="h-[10vh] w-screen flex flex-row justify-end"
			style={{
				backgroundImage:
					"url('./public/assets/cryptocurrency-coding-digital-black-background-open-source-blockchain-concept.jpg')",
			}}
		>
			<div className="flex items-center align-middle justify-end px-5">
				<button
					onClick={signout}
					type="button"
					className="h-10 p-1 text-xl uppercase rounded-md border border-red-400 text-red-600 hover:bg-red-400 hover:text-white transition-colors duration-200"
				>
					Logout
				</button>
			</div>
		</div>
	);
}

export default Header;
