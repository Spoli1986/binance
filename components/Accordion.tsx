import * as React from "react";
import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import MuiAccordionSummary, {
	AccordionSummaryProps,
} from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { ReactElement } from "react";

type Props = {
	children: ReactElement;
};

const Accordion = styled((props: AccordionProps) => (
	<MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
	border: `1px solid ${theme.palette.divider}`,
	"&:not(:last-child)": {
		borderBottom: 0,
	},
	"&:before": {
		display: "none",
	},
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary
		expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
		{...props}
	/>
))(({ theme }) => ({
	backgroundColor:
		theme.palette.mode === "dark"
			? "rgba(255, 255, 255, .05)"
			: "rgba(0, 0, 0, .03)",
	flexDirection: "row-reverse",
	"& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
		transform: "rotate(90deg)",
	},
	"& .MuiAccordionSummary-content": {
		marginLeft: theme.spacing(1),
	},
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
	padding: theme.spacing(2),
	borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

export default function CustomizedAccordions({ children }: Props) {
	const [expanded, setExpanded] = React.useState<string | false>("");

	const handleChange =
		(panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
			setExpanded(newExpanded ? panel : false);
		};

	return (
		<div>
			<Accordion
				expanded={expanded === "panel1"}
				onChange={handleChange("panel1")}
				sx={{
					borderRadius: "6px",
					border: "none",
				}}
			>
				<AccordionSummary
					aria-controls="panel1d-content"
					id="panel1d-header"
					sx={{
						background:
							"linear-gradient(to right, rgb(107, 33, 168), rgb(76, 29, 149), rgb(107, 33, 168))",
						color: "white",
						borderRadius: "6px",
						border: "none",
					}}
				>
					<Typography>How it works?</Typography>
				</AccordionSummary>
				<AccordionDetails>{children}</AccordionDetails>
			</Accordion>
		</div>
	);
}
