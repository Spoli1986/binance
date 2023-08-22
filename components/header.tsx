import React from "react";
import Bg from "../public/assets/bg_header.jpg";
import Image from "next/image";
import LongMenu from "./Burger";
type Props = {};

function Header({}: Props) {
	return (
		<div className="h-[250px] w-screen flex flex-row justify-end">
			<Image src={Bg} alt="Background header" className="w-screen" />
			<LongMenu />
		</div>
	);
}

export default Header;
