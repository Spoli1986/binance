export interface ResponseFuncs {
	GET?: Function;
	POST?: Function;
	PUT?: Function;
	DELETE?: Function;
}

export interface Strategies {
	[key: string]: string[]; // This index signature allows any string key to be used to access string values
}

export type TUser = {
	_id: string;
	email: string;
	password: string;
	confirmed: boolean;
	strategies: Strategies;
	wsKey: string;
	role: string;
};

export type TAError = {
	status: number;
	message: string;
};
