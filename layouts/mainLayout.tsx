import { ReactElement, ReactNode } from "react";
import Header from "../components/header";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

type MainLayoutProps = {
	children: ReactNode;
};

function MainLayout({ children }: MainLayoutProps) {
	const session = useSession();
	const router = useRouter();
	return (
		<>
			{session.status === "unauthenticated" && (
				<div>
					<div
						style={{
							width: "100%",
							height: 0,
							paddingBottom: "75%",
							position: "relative",
						}}
					>
						<iframe
							src="https://giphy.com/embed/owRSsSHHoVYFa"
							width="100%"
							height="100%"
							style={{ position: "absolute" }}
							// class="giphy-embed"
							allowFullScreen
						></iframe>
					</div>
					<p>
						<a href="https://giphy.com/gifs/owRSsSHHoVYFa">via GIPHY</a>
					</p>
				</div>
			)}
			{session.status === "loading" && <div>Wait...</div>}
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
