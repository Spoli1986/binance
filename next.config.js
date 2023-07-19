/** @type {import('next').NextConfig} */

const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");
module.exports = (phase, { defaultConfig }) => {
	if (phase === PHASE_DEVELOPMENT_SERVER) console.log("server running");
	else console.log(defaultConfig);
};
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	output: "standalone",
};

module.exports = nextConfig;
