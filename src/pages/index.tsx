import Image from "next/image";
import Bg from "../../public/assets/3Kxn.gif";
import Router from "next/router";

export default function Home() {
	return (
		<div className="flex flex-col items-center justify-center w-screen">
			<Image src={Bg} alt="Background" className="w-screen h-screen" />
			<div className="flex flex-col gap-4 bg-slate-100/30 p-4 rounded-md absolute top-5 right-10">
				<div>
					<button onClick={() => Router.push("/login")} className="text-white">
						Login
					</button>
				</div>
				<div>
					<button onClick={() => Router.push("/signup")} className="text-white">
						Signup
					</button>
				</div>
			</div>
		</div>
	);
}
