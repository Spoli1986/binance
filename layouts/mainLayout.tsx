import { ReactElement, ReactNode } from "react";
import Header from "../components/header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Loading from "../components/Loading";
import Image from "next/image";
import MagicWord from "../public/assets/animation_llnjdqjb_small.gif";

type MainLayoutProps = {
	children: ReactNode;
};

function MainLayout({ children }: MainLayoutProps) {
	const session = useSession();
	const router = useRouter();
	return (
		<>
			{session.status === "unauthenticated" && (
				<div className="w-full h-screen overflow-x-auto flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900">
					<div className="flex flex-col gap-4 bg-slate-100/30 p-4 rounded-md absolute top-5 right-10">
						<div>
							<button onClick={() => router.push("/login")} className="text-white">
								Login
							</button>
						</div>
						<div>
							<button onClick={() => router.push("/signup")} className="text-white">
								Signup
							</button>
						</div>
					</div>
					<Image src={MagicWord} alt="Background" width={700} />
				</div>
			)}
			{session.status === "loading" && (
				<div>
					<div className="w-full h-screen overflow-x-auto flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900">
						<Loading />
					</div>
				</div>
			)}
			{session.status === "authenticated" && (
				<div>
					<Header />
					{children}
				</div>
			)}
		</>
	);
}

export default MainLayout;
