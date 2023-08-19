export interface ResponseFuncs {
	GET?: Function;
	POST?: Function;
	PUT?: Function;
	DELETE?: Function;
}

export type TWsKey = {
	owner: string;
	wsKey: string;
};

export type TUser = {
	email: string;
	password: string;
	confirmed: boolean;
};
