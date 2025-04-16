import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

import CardHeader from '@/components/cardHeader';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { ArrowDropDownCircleOutlined } from '@mui/icons-material';

function SalesOverviewCard({ cuttingData }) {
	return (
		<Card>
			<CardHeader title="Status Overview" size="small" />
			<CustomersChart cuttingData={cuttingData} />
		</Card>
	);
}

function CustomersChart({ cuttingData }) {
	return (
		<Box sx={{ mt: 1 }}>
			{cuttingData.routeSheetresult.length > 0 ? (
				cuttingData.routeSheetresult.map((item, index) => (
					<Accordion key={item.id}>
						<AccordionSummary
							expandIcon={<ArrowDropDownCircleOutlined />}
							aria-controls="panel2-content"
							id="panel2-header"
						>
							<Typography component="span">{item.routeSheet}</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Typography>Under Development</Typography>
						</AccordionDetails>
					</Accordion>
				))
			) : (
				<Typography component="span">No pending routesheets</Typography>
			)}
		</Box>
	);
}

export default SalesOverviewCard;
