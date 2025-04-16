import { useTheme } from '@mui/material/styles';

import Chart from 'react-apexcharts';
import getDefaultChartsColors from '@helpers/getDefaultChartsColors';

import Card from '@mui/material/Card';
import Box from '@mui/material/Box';

import CardHeader from '@/components/cardHeader';

const getCustomerGraphConfig = (config, cuttingData) => ({
	options: {
		colors: getDefaultChartsColors(1),
		chart: {
			...(config?.mode === 'dark' && { foreColor: '#fff' }),
			toolbar: {
				show: false,
			},
			sparkline: {
				enabled: true,
			},
			parentHeightOffset: 0,
		},
		labels: ['Pending', 'Completed'],
		legend: {
			show: true,
			position: 'bottom',
			horizontalAlign: 'left',
			formatter(seriesName, opts) {
				return [seriesName, ' - ', opts.w.globals.series[opts.seriesIndex].toLocaleString()];
			},
			fontFamily: 'inherit',
			fontSize: 13,

			floating: true,
			offsetY: 90,
			markers: {
				width: 15,
				height: 15,
			},
		},
		tooltip: {
			formatter(value) {
				return (+value).toLocaleString();
			},
		},
		plotOptions: {
			pie: {
				donut: {
					labels: {
						show: true,
						name: {
							fontFamily: 'inherit',
							fontSize: 13,
						},
						value: {
							formatter(value) {
								return (+value).toLocaleString();
							},
						},
						total: {
							show: true,
						},
					},
				},
			},
		},
	},
	series: [
		cuttingData.routesheetcount - cuttingData.processingData[0].checkedRFD,
		cuttingData.processingData[0].checkedRFD,
	],
});
function MostVisitedCard({ cuttingData }) {
	const theme = useTheme();

	return (
		<Card>
			<CardHeader title="Status Report" size="small" />
			<Box
				color="text.primary"
				component={Chart}
				options={getCustomerGraphConfig({ mode: theme.palette.mode }, cuttingData)?.options}
				series={getCustomerGraphConfig({ mode: theme.palette.mode }, cuttingData)?.series}
				type="donut"
				width="100%"
				height="100%"
				mb={12}
				mt={2}
			/>
		</Card>
	);
}

export default MostVisitedCard;
