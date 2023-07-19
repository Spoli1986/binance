import { FormEvent, FormEventHandler, useCallback, useState } from "react";
import Router from "next/router";
import { signIn, useSession } from "next-auth/react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { connect } from "../../utils/connection";

type UserData = {
	email: string;
	password: string;
};

const INITIAL_DATA: UserData = {
	email: "",
	password: "",
};
let socket: any;

const Login = () => {
	const [data, setData] = useState(INITIAL_DATA);
	const session = useSession();
	const [emailError, setEmailError] = useState<string>("");
	const [passwordError, setPasswordError] = useState<string>("");
	const { executeRecaptcha } = useGoogleReCaptcha();

	const handleSubmitForm = async (e: FormEvent) => {
		e.preventDefault();
		if (!executeRecaptcha) {
			console.log("Execute recaptcha not yet available");
			return;
		}
		executeRecaptcha("enquiryFormSubmit").then((gReCaptchaToken) => {
			loginUser(gReCaptchaToken);
		});
	};

	if (session.status === "authenticated") {
		Router.push("/positions");
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
			role: data.email === "admin@patronpay.ch" ? "admin" : "",
		})
			.then((res) => {
				if (res?.error) setEmailError(res.error);
			})
			.catch((err) => console.log(err));
	};

	return (
		<div>
			<div className="flex flex-col w-screen h-[85vh] align-middle justify-center">
				<form
					onSubmit={handleSubmitForm}
					className="flex flex-col font-inter md:w-1/3 gap-7 self-center"
				>
					<h1 className="font-bold font-Raleway text-space_cadet text-5xl">Login</h1>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col">
							<label htmlFor="email" className="text-grey_web text-sm">
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
							<label htmlFor="password" className="text-grey_web text-sm">
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
						<button role="button">Submit</button>
						{passwordError ||
							(emailError && (
								<div className="text-error_background">{passwordError}</div>
							))}
					</div>
				</form>
				<div className="self-center text-silver text-sm mt-10">
					This site is protected by reCAPTCHA and the Google if you&apos;re a robot,
					or do not own this site, just fuck off!!!
				</div>
			</div>
		</div>
	);
};

export default Login;