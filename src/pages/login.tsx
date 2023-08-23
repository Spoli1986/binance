import { FormEvent, FormEventHandler, useCallback, useState } from "react";
import Router from "next/router";
import { signIn, useSession } from "next-auth/react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Image from "next/image";
import Bg from "../../public/assets/U1c.gif";
import Loading from "../../components/Loading";

type UserData = {
	email: string;
	password: string;
};

const INITIAL_DATA: UserData = {
	email: "",
	password: "",
};

const Login = () => {
	const [data, setData] = useState<UserData>(INITIAL_DATA);
	const session = useSession();
	const [emailError, setEmailError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	const { executeRecaptcha } = useGoogleReCaptcha();

	const handleSubmitForm = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		if (!executeRecaptcha) {
			console.log("Execute recaptcha not yet available");
			setLoading(false);
			return;
		}
		executeRecaptcha("enquiryFormSubmit").then((gReCaptchaToken) => {
			loginUser(gReCaptchaToken);
		});
	};

	if (session.status === "authenticated") {
		Router.push("/home");
	}

	function updateFields(fields: Partial<UserData>) {
		setData({ ...data, ...fields });
	}

	const loginUser = async (gReCaptchaToken: string) => {
		const res: any = await signIn("credentials", {
			redirect: false,
			email: data.email,
			password: data.password,
			recaptchaToken: gReCaptchaToken,
			callbackUrl: `${window.location.origin}`,
			role: data.email === "admin@spolarpeter.cc" ? "admin" : "",
		})
			.then((res) => {
				setLoading(false);
				if (res?.error) setEmailError(res.error);
			})
			.catch((err) => {
				setLoading(false);
				console.log(err);
			});
	};

	return (
		<div>
			<div className="flex flex-col w-screen h-screen items-center justify-center relative">
				<div className="flex flex-col gap-4 bg-slate-100/30 p-4 rounded-md absolute top-5 right-10 z-20">
					<div>
						<button onClick={() => Router.push("/signup")} className="text-white">
							Signup
						</button>
					</div>
				</div>

				<Image src={Bg} alt="Background" className="absolute h-screen w-screen" />

				{session.status === "loading" && <Loading />}
				{session.status === "unauthenticated" && (
					<div className="absolute w-[90%] sm:w-auto">
						<form
							onSubmit={handleSubmitForm}
							className="flex flex-col font-inter md:w-[450px] gap-7"
						>
							<div className="flex flex-col gap-4 bg-slate-100/30 p-4 rounded-md">
								<div className="flex flex-col">
									<label htmlFor="email" className="text-white text-sm">
										Email
									</label>
									<input
										autoFocus
										onChange={(e) => updateFields({ ...data, email: e.target.value })}
										type="email"
										name="email"
										placeholder="Email"
										className="text-onyx border border-[#B5B5B5] h-12 rounded p-2 outline-none"
									/>
								</div>

								<div className="flex flex-col">
									<label htmlFor="password" className="text-white text-sm">
										Password
									</label>
									<input
										autoFocus
										onChange={(e) => updateFields({ ...data, password: e.target.value })}
										type="password"
										name="password"
										placeholder="Password"
										required
										className="text-onyx border border-[#B5B5B5] h-12 rounded p-2 outline-none content-['*']"
									/>
								</div>
								{loading ? (
									<Loading type="button" />
								) : (
									<button role="button" className="text-white">
										Submit
									</button>
								)}
							</div>
							{emailError && (
								<div className="text-center text-red-500 p-2 bg-red-100 animate-pulse rounded">
									{emailError}
								</div>
							)}
						</form>
					</div>
				)}
				<div className=" text-white text-sm mt-10 absolute bottom-2 w-96 text-center">
					<p>
						This site is protected by reCAPTCHA and the Google. <br />
						If you&apos;re a robot, or do not own this site, just fuck off!!!
					</p>
				</div>
			</div>
		</div>
	);
};

export default Login;
