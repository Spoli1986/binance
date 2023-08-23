import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { signOut } from "next-auth/react";
import Router from "next/router";

export default function LongMenu() {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const signout = () => {
		signOut({ callbackUrl: "/" });
	};

	return (
		<div className="absolute z-10 top-20 right-20 ">
			<IconButton
				aria-label="more"
				id="long-button"
				aria-controls={open ? "long-menu" : undefined}
				aria-expanded={open ? "true" : undefined}
				aria-haspopup="true"
				onClick={handleClick}
				size="large"
			>
				<MenuOpenIcon
					style={{ color: "white" }}
					fontSize="large"
					className={`${open ? "animate-spin transition-all duration-300" : ""} `}
				/>
			</IconButton>
			<Menu
				id="long-menu"
				MenuListProps={{
					"aria-labelledby": "long-button",
				}}
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
			>
				<MenuItem
					onClick={() => {
						Router.push("/home");
						handleClose();
					}}
				>
					Home
				</MenuItem>
				<MenuItem
					onClick={() => {
						Router.push("/positions");
						handleClose();
					}}
				>
					Positions
				</MenuItem>
				<MenuItem
					onClick={() => {
						Router.push("/strategies");
						handleClose();
					}}
				>
					Strategies
				</MenuItem>
				<MenuItem onClick={signout}>Logout</MenuItem>
			</Menu>
		</div>
	);
}
