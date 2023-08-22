import React from "react";
import Image from "next/image";
import Coin from "../public/assets/coin_loading.png";

type Props = {};

function Loading({}: Props) {
	return (
		<div className="">
			<Image
				src={Coin}
				alt="Loading..."
				className="rotated rounded-full w-60 sm:w-96"
			/>
		</div>
	);
}

export default Loading;
