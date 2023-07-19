import "../styles/globals.css";
import { NextPage } from "next";
import type { AppProps } from "next/app";
import { ReactElement, ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
	getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

export default function App({
	Component,
	pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
	const getLayout = Component.getLayout ?? ((page) => page);
	const layout = getLayout(<Component {...pageProps} />);
	return (
		<>
			<GoogleReCaptchaProvider
				reCaptchaKey={
					process.env.NEXT_PUBLIC_RECAPTCHA_SITE
						? process.env.NEXT_PUBLIC_RECAPTCHA_SITE
						: ""
				}
				scriptProps={{
					async: false,
					defer: false,
					appendTo: "head",
					nonce: undefined,
				}}
			>
				<SessionProvider session={session}>{layout}</SessionProvider>
			</GoogleReCaptchaProvider>
		</>
	);
}
