import React from "react";
import Image from "next/image";
import Coin from "../public/assets/coin_loading.png";

type Props = {
	type?: string;
};

function Loading({ type }: Props) {
	return (
		<div className="">
			<Image
				src={Coin}
				alt="Loading..."
				className={`rotated rounded-full ${
					type ? "w-14 sm:w-24 " : "w-60 md:w-96"
				}`}
			/>
		</div>
	);
}

export default Loading;
