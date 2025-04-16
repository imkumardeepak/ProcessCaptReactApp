import useAutoCounter from '@hooks/useAutoCounter';

import Chart from 'react-apexcharts';
import getDefaultChartsColors from '@helpers/getDefaultChartsColors';

import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';

import CardHeader from '@/components/cardHeader';
import { ArrowUpwardOutlined } from '@mui/icons-material';

const impressionsGraphConfig = {
	options: {
		fill: {
			colors: getDefaultChartsColors(3),
		},
		chart: {
			toolbar: {
				show: false,
			},
			sparkline: {
				enabled: true,
			},
			parentHeightOffset: 0,
		},
		stroke: {
			colors: getDefaultChartsColors(3),
			width: 2,
		},
		markers: {
			size: 0,
		},
		grid: {
			show: false,
		},
		xaxis: {
			show: false,
		},
		tooltip: {
			enabled: false,
		},
		yaxis: {
			show: false,
		},
	},
	series: [
		{
			name: 'series-1',
			data: [9, 13, 12, 15, 12, 11, 15, 16, 17, 10, 15],
		},
	],
};
function PageImpressionsCard({ cuttingData }) {
	const counter = useAutoCounter({
		limiter: cuttingData.routesheetcount || 0,
		increment: 1,
		interval: 1,
	});
	return (
		<Card type="none">
			<Stack direction="column" spacing={0} px={3} pt={3}>
				<CardHeader title="TOTAL ROUTESHEET" size="small" />
				<Typography variant="body2" fontSize={35} color="primary.main">
					{counter.toLocaleString()}
				</Typography>
				<Stack direction="row" alignItems="center" spacing={0.5}>
					<Avatar
						sx={{
							bgcolor: 'success.light',
							color: 'success.dark',
							width: 24,
							height: 24,
						}}
						variant="rounded"
					>
						<ArrowUpwardOutlined fontSize="small" />
					</Avatar>
					<Typography color="success.main" component="span" ml={1}>
						+2.5%
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Working Routesheet
					</Typography>
				</Stack>
			</Stack>
			<Chart
				options={impressionsGraphConfig.options}
				series={impressionsGraphConfig.series}
				type="area"
				width="100%"
				height="100px"
			/>
		</Card>
	);
}

export default PageImpressionsCard;
