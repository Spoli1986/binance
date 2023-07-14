declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: "development" | "production";
		}
	}
}
declare module "@react-pdf/renderer/lib/react-pdf.browser.es.js";

export {};
