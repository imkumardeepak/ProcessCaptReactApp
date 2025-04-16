import useAutoCounter from '@hooks/useAutoCounter';

import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';

import CardHeader from '@/components/cardHeader';

function SaleProgressCard({ cuttingData }) {
	const SALES_PROGRESS_DATA = [
		{
			sale: cuttingData.routesheetcount - cuttingData.processingData[0].checkedRFI,
			progress: 20,
			color: 'info',
			name: 'QCF',
		},
		{
			sale: cuttingData.routesheetcount - cuttingData.processingData[0].checkedRFG,
			progress: 40,
			color: 'error',
			name: 'RFG',
		},
		{
			sale: cuttingData.routesheetcount - cuttingData.processingData[0].checkedgALVA,
			progress: 60,
			color: 'tertiary',
			name: 'GALVA',
		},
		{
			sale: cuttingData.routesheetcount - cuttingData.processingData[0].checkedQCG,
			progress: 80,
			color: 'warning',
			name: 'QCG',
		},
		{
			sale: cuttingData.routesheetcount - cuttingData.processingData[0].checkedRFD,
			progress: 100,
			color: 'success',
			name: 'RFD',
		},
	];
	return (
		<Card>
			<CardHeader title="Routesheet Progress" size="small" />
			<Stack spacing={2} mt={2}>
				{SALES_PROGRESS_DATA.map((sale, index) => (
					<SaleProgress key={index} saleData={sale} />
				))}
			</Stack>
		</Card>
	);
}

function SaleProgress({ saleData }) {
	const { progress, color, sale, name } = saleData;
	console.log(saleData);
	const counter = useAutoCounter({
		limiter: sale,
		increment: 1,
		interval: 1,
	});
	return (
		<div>
			<Typography variant="body2" color="text.secondary" gutterBottom>
				{counter.toLocaleString()} {name} Pending
			</Typography>
			<LinearProgress
				variant="determinate"
				color={color}
				value={(counter * progress) / sale}
				sx={{
					height: 7,
				}}
			/>
		</div>
	);
}

export default SaleProgressCard;
