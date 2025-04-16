import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import { useApi } from '@/services/machineAPIService';
import useData from '@/utils/hooks/useData';

import { useTheme } from '@mui/material/styles';

import Chart from 'react-apexcharts';
import getDefaultChartsColors from '@helpers/getDefaultChartsColors';

import CardHeader from '@/components/cardHeader';

function EarningsSection() {
	const theme = useTheme();
	const { fetchData } = useApi();
	const { data: usersData, isLoading, error } = useData('Count', () => fetchData('Home/iscompleted'));

	const [pendingCount, setPendingCount] = useState(0);
	const [completedCount, setCompletedCount] = useState(0);
	const [shopfloorcount, setshopfloorcount] = useState(0);

	useEffect(() => {
		if (usersData) {
			setPendingCount(usersData.pendingCount || 0);
			setCompletedCount(usersData.completedCount || 0);
			setshopfloorcount(usersData.shopfloor || 0);
		}
	}, [usersData]);

	const getCustomerGraphConfig = (config) => ({
		options: {
			colors: getDefaultChartsColors(2),
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
		series: [pendingCount, completedCount],
	});

	return (
		<Card>
			<CardHeader title="Status Report" size="small" />
			<Box
				color="text.primary"
				component={Chart}
				options={getCustomerGraphConfig({ mode: theme.palette.mode })?.options}
				series={getCustomerGraphConfig({ mode: theme.palette.mode })?.series}
				type="donut"
				width="100%"
				height="100%"
				mb={10}
				mt={0}
			/>
		</Card>
	);
}

export default EarningsSection;
