import Image from "next/image";
import Bg from "../../public/assets/4yD.gif";
import type { NextPage } from "next";
import { useState } from "react";
import Router from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { useValidator } from "../../utils/commonFunctions";
import axios, { AxiosError, AxiosResponse } from "axios";
import Loading from "../../components/Loading";

type UserData = {
	emailAddress: string;
	password: string;
};

const INITIAL_DATA: UserData = {
	emailAddress: "",
	password: "",
};

const Signup: NextPage = () => {
	const [data, setData] = useState(INITIAL_DATA);
	const [createSuccess, setCreateSuccess] = useState();
	const [response, setResponse] = useState({
		status: 0,
		message: "",
	});
	const [error, setError] = useState({
		emailError: "",
		passwordError: "",
	});
	const [passwordShown, setPasswordShown] = useState(false);
	const [hideIcon, setHideIcon] = useState(true);
	const [loading, setLoading] = useState<boolean>(false);

	const { emailValidator } = useValidator();

	const { passwordValidator } = useValidator();

	const successPage = () => {
		Router.push("/");
	};

	function updateFields(fields: Partial<UserData>) {
		setData((prev) => {
			return { ...prev, ...fields };
		});
	}

	function setPasswordVisibility() {
		setPasswordShown(!passwordShown);
		setHideIcon(!hideIcon);
	}

	const registerUser = async (e: any) => {
		e.preventDefault();
		const isValidPassword = passwordValidator(data.password)
			? null
			: "Invalid password!";
		const isValidEmail = emailValidator(data.emailAddress)
			? null
			: "Invalid email address";
		const body: any = {
			email: data.emailAddress,
			password: data.password,
		};
		if (isValidEmail)
			return setError((error) => ({
				...error,
				emailError: "Invalid email address",
			}));
		else if (isValidPassword)
			return setError({
				emailError: "",
				passwordError: "Your password is invalid!",
			});
		setError({
			passwordError: "",
			emailError: "",
		});
		try {
			setLoading(true);

			const res: AxiosResponse = await axios.post("/api/users", body);
			console.log("da");
			setResponse({ status: res.status, message: res.data.message });
			res.status === 200 && setData(INITIAL_DATA);
			setLoading(false);
		} catch (error: any) {
			setResponse({
				status: error.response.status,
				message: error.response.data.message,
			});
			console.log(error);
			setLoading(false);
		}
	};

	return (
		<div>
			{createSuccess === "error" ? (
				<div>Error</div>
			) : (
				<div className="flex flex-col w-screen h-screen align-middle items-center justify-center">
					<div className="flex flex-col gap-4 bg-slate-100/30 p-4 rounded-md absolute top-5 right-10 z-20">
						<div>
							<button onClick={() => Router.push("/login")} className="text-white">
								Login
							</button>
						</div>
					</div>
					<Image
						src={Bg}
						alt="Background"
						className="absolute h-screen w-screen -z-10"
					/>

					<form
						onSubmit={registerUser}
						className="flex flex-col font-inter w-3/4 md:w-[450px] gap-7 top-1/3 self-center"
					>
						<div className="flex flex-col gap-4 bg-slate-100/30 p-4 rounded-md">
							<div className="flex flex-col gap-2 w-full">
								<label htmlFor="email" className="text-white text-sm">
									Email address
								</label>
								<input
									type="email"
									name="email"
									placeholder="Email"
									required={true}
									value={data.emailAddress}
									onChange={(e) => updateFields({ emailAddress: e.target.value })}
									className="text-onyx border border-[#B5B5B5] h-12 rounded p-2 outline-none"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label htmlFor="password" className="text-white text-sm">
									Password
								</label>
								<div className="w-full relative">
									<input
										type={passwordShown ? "text" : "password"}
										name="password"
										placeholder="Password"
										required={true}
										value={data.password}
										onChange={(e) => updateFields({ password: e.target.value })}
										className="text-onyx border border-[#B5B5B5] h-12 rounded p-2 content-['*'] outline-none w-full"
									/>
									<div>
										{hideIcon ? (
											<FontAwesomeIcon
												icon={faEyeSlash}
												className={
													"absolute top-4 right-5 cursor-pointer"
													// `${hideIcon}`
												}
												onMouseEnter={setPasswordVisibility}
												onMouseLeave={setPasswordVisibility}
											/>
										) : (
											<FontAwesomeIcon
												icon={faEye}
												className="absolute top-4 right-5 cursor-pointer"
												onMouseEnter={setPasswordVisibility}
												onMouseLeave={setPasswordVisibility}
											/>
										)}
									</div>
								</div>
								<label htmlFor="password" className="text-white text-sm text-center">
									The password must be 8 characters long and contain at least one
									uppercase letter, one number and one special character. No whitespace
									is allowed!
								</label>
								{loading ? (
									<Loading type="button" />
								) : (
									<button role="button" className="text-white">
										Submit
									</button>
								)}
							</div>
						</div>
						<div className="font-inter text-center self-center">
							{response.status === 400 && (
								<div className="text-center text-red-500 p-2 bg-red-100 animate-pulse rounded">
									{response.message}
								</div>
							)}
							{response.status === 200 && (
								<>
									<div
										className={
											"bg-green-300/40 rounded p-2 text-xl flex flex-col self-center m-5" +
											(response.status === 200 ? "" : "hidden")
										}
									>
										{response.message}
										<button
											className="bg-green-500 hover:bg-green-600 rounded-lg w-20 p-2 self-center my-3 text-sm"
											onClick={successPage}
										>
											OK
										</button>
									</div>
								</>
							)}
							{error.passwordError !== "" && (
								<div className="text-center text-red-500 p-2 bg-red-100 animate-pulse rounded">
									{error.passwordError}
								</div>
							)}
							{error.emailError !== "" && (
								<div className="text-center text-red-500 p-2 bg-red-100 animate-pulse rounded">
									{error.emailError}
								</div>
							)}
						</div>
					</form>
				</div>
			)}
		</div>
	);
};

export default Signup;
