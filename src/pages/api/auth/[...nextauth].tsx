import CredentialsProvider from "next-auth/providers/credentials";
import LinkedInProvider from "next-auth/providers/linkedin";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../../lib/mongodb";
import { connect } from "../../../../utils/connection";
import { compare } from "bcrypt";
import EmailProvider from "next-auth/providers/email";
import axios from "axios";
import NextAuth from "next-auth";
import User from "../../../../model/User";

export default NextAuth({
	providers: [
		LinkedInProvider({
			clientId: process.env.LINKEDIN_CLIENT_ID as string,
			clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
		}),

		EmailProvider({
			server: {
				host: process.env.NEXT_PUBLIC_SENDGRID_SERVER,
				port: 578,
				auth: {
					user: process.env.NEXT_PUBLIC_SENDGRID_USER,
					pass: process.env.NEXT_PUBLIC_SENDGRID_PASSWORD,
				},
			},
			from: process.env.NEXT_PUBLIC_SENDGRID_EMAIL,
		}),

		CredentialsProvider({
			id: "credentials",
			// The name to display on the sign in form (e.g. "Sign in with...")
			name: "Credentials",
			// The credentials is used to generate a suitable form on the sign in page.
			// You can specify whatever fields you are expecting to be submitted.
			// e.g. domain, username, password, 2FA token, etc.
			// You can pass any HTML attribute to the <input> tag through the object.
			credentials: {
				email: {
					label: "email",
					type: "text",
				},
				password: {
					label: "password",
					type: "password",
				},
				recaptchaToken: {
					label: "recaptchaToken",
					type: "text",
				},
			},
			async authorize(credentials) {
				await connect();
				const body = {
					secret: process.env.RECAPTCHA_SECRET,
					response: credentials?.recaptchaToken,
				};
				const recaptchaResponse = await axios.post(
					"https://www.google.com/recaptcha/api/siteverify",
					body,
					{
						headers: {
							"Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
						},
					},
				);

				if (recaptchaResponse.data.score > 0.5) {
					const user = await User.findOne({ email: credentials?.email });
					if (!user) throw new Error("You've not even registered, bitch...");
					const isPasswordCorrect = await compare(
						credentials!.password,
						user.password,
					);
					if (!isPasswordCorrect)
						throw new Error("Remember your credentials, bitch...");
					if (!user.confirmed) throw new Error("Just wait for your turn...");
					if (isPasswordCorrect && user.confirmed) return user;
					else throw new Error("not quite my tempo");
				}
			},
		}),
	],
	callbacks: {
		jwt: async ({ token, user }) => {
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		session: ({ session, token }) => {
			if (token) {
				session.user = token;
			}
			return session; // The return type will match the one returned in `useSession()`
		},
	},
	adapter: MongoDBAdapter(clientPromise),
	debug: process.env.NODE_ENV === "development",
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/login",
	},
	jwt: {
		secret: process.env.NEXTAUTH_JWT_SECRET,
	},
	secret: process.env.NEXTAUTH_SECRET,
});
