import React, { ReactNode } from "react";
import MainLayout from "../../layouts/mainLayout";
import Image from "next/image";
import ImgHome from "../../public/assets/arrow_home.png";
import ImgPositions from "../../public/assets/positions.png";
import ImgStrategies1 from "../../public/assets/arrow_strategies_1.png";
import ImgStrategies2 from "../../public/assets/arrow_strategies_2.png";
import ImgStrategies3 from "../../public/assets/arrow_strategies_3.png";

type Props = {};

function Home({}: Props) {
	return (
		<div className="w-full overflow-x-auto min-h-[calc(100vh-250px)] flex flex-col items-center bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900 p-10 gap-20">
			{/* {session.status === "authenticated" && ( */}
			<h1 className="text-white text-3xl">WTF Is This Page???</h1>
			<div className="flex flex-col gap-10 items-center py-10">
				<h3 className="text-white text-2xl">Navigation</h3>
				<h5 className="text-white underline italic">Home (You are here)</h5>
				<Image src={ImgHome} alt="home" height={500} width={750} />
				<p className="text-white">
					Click on the icon to open the menu. You can navigate between pages by
					clicking on the page names.
				</p>

				<h5 className="text-white underline italic">Positions</h5>
				<Image src={ImgPositions} alt="home" height={500} width={750} />
				<p className="text-white">
					On this site, you can view all your open positions and orders. Please note
					that the information provided is a snapshot and not real-time data.
				</p>

				<h5 className="text-white underline italic">Strategies</h5>
				<Image src={ImgStrategies1} alt="home" height={500} width={750} />
				<p className="text-white">
					Click on the purple area to open the strategy description. The description
					includes a list of automatically created orders, the strategy&apos;s
					utility, and a demonstration chart.
				</p>

				<Image src={ImgStrategies2} alt="home" height={500} width={750} />
				<p className="text-white">
					Select the assets you want to assign to the strategy. Remember that each
					asset can only be assigned to one strategy. If you wish to switch, you must
					first remove it from the current strategy and then select another. <br />
					<span className="text-red-600">
						!!! IMPORTANT !!! Always close positions and orders before switching
						strategies. !!! IMPORTANT !!!
					</span>
				</p>

				<Image src={ImgStrategies3} alt="home" height={500} width={750} />
				<p className="text-white">
					<span className="text-red-600">
						!!! IMPORTANT !!! Always remember to save your changes before leaving the
						page or switching menus. No warning will be shown if you don&apos;t. !!!
						IMPORTANT !!!
					</span>
				</p>

				<h2 className="text-white text-3xl">That&apos;s it MOFOs, enjoy!</h2>
			</div>
		</div>
	);
}

export default Home;

Home.getLayout = (page: ReactNode) => <MainLayout>{page}</MainLayout>;
