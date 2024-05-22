export interface ResponseFuncs {
	GET?: Function;
	POST?: Function;
	PUT?: Function;
	DELETE?: Function;
}

export interface iStrategies {
	[key: string]: string[]; // This index signature allows any string key to be used to access string values
}

export type TUser = {
	_id: string;
	email: string;
	password: string;
	confirmed: boolean;
	strategies: iStrategies;
	wsKey: string;
	role: string;
	isOpenConnection: boolean;
};

export type TAError = {
	status: number;
	message: string;
};

export type TStrategyDefs = {
	_id: string;
	strategies: string[];
};
