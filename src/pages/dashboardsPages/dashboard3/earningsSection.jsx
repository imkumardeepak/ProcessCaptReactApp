import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import { useApi } from '@/services/machineAPIService';
import useData from '@/utils/hooks/useData';

import { useTheme } from '@mui/material/styles';

import Chart from 'react-apexcharts';
import getDefaultChartsColors from '@helpers/getDefaultChartsColors';

import CardHeader from '@/components/cardHeader';
import { Skeleton, Typography } from '@mui/material';

function EarningsSection() {
	const theme = useTheme();
	const { fetchData } = useApi();
	const { data: usersData, isLoading, error } = useData('Dashboard', () => fetchData('Home/GetOverallView')); // Fetch employee data
	const [displayData, setDisplayData] = useState([]);

	useEffect(() => {
		if (usersData) {
			setDisplayData(usersData);
		} else {
			setDisplayData([]);
		}
	}, [usersData]);

	const getCustomerGraphConfig = (config) => ({
		options: {
			colors: getDefaultChartsColors(3),
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
			labels: ['Planning Release', 'Shop Floor Release', 'Pending Floor Release', 'Completed Routesheet'],
			legend: {
				show: true,
				position: 'bottom',
				horizontalAlign: 'left',
				formatter(seriesName, opts) {
					return [seriesName, ' - ', opts.w.globals.series[opts.seriesIndex].toLocaleString()];
				},
				fontFamily: 'inherit',
				fontSize: 13,

				floating: false,
				offsetY: 10,
				markers: {
					width: 10,
					height: 10,
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
			displayData.planningReleaseRoutesheet || 0,
			displayData.shopReleaseRouteshhet || 0,
			displayData.pendingshopReleaseRouteshhet || 0,
			displayData.completedRoutesheet || 0,
		],
	});
	const chartConfig = getCustomerGraphConfig({ mode: theme.palette.mode });
	return (
		<Card>
			<CardHeader title="Status Report" size="small" />
			{isLoading ? (
				<Skeleton variant="rectangular" height={150} animation="wave" />
			) : error ? (
				<Box p={2} textAlign="center">
					<Typography color="error">Error loading data</Typography>
				</Box>
			) : (
				<Box
					component={Chart}
					options={chartConfig.options}
					series={chartConfig.series}
					type="donut"
					width="100%"
					height={250}
				/>
			)}
		</Card>
	);
}

export default EarningsSection;
