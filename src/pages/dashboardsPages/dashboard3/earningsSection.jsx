import { useState, useEffect } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useApi } from '@/services/machineAPIService';
import useData from '@/utils/hooks/useData';
import getColors from '@/utils/helpers/getDefaultChartsColors';

function EarningsSection() {
	const { fetchData } = useApi();
	const { data: usersData, isLoading, error } = useData('Count', () => fetchData('ProcessingOrders/iscompleted'));

	const [pendingCount, setPendingCount] = useState(0);
	const [completedCount, setCompletedCount] = useState(0);

	useEffect(() => {
		if (usersData) {
			setPendingCount(usersData.pendingCount || 0);
			setCompletedCount(usersData.completedCount || 0);
		}
	}, [usersData]);

	// Define a color type (e.g., 1, 2, 3, 4, or 5)
	const colorType = 2; // You can change this to use different color sets
	const colors = getColors(colorType);

	const chartData = [
		{ label: 'Pending', value: pendingCount, color: colors[0] }, // Color from palette
		{ label: 'Completed', value: completedCount, color: colors[1] }, // Color from palette
	];

	return (
		<Card
			type="none"
			sx={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<Stack direction="column" spacing={1} px={3} pt={3} flexGrow={1}>
				<Typography variant="h5" fontWeight="500" textTransform="uppercase">
					Today&apos;s Working Progress
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Here&apos;s a summary of today&apos;s production order status.
				</Typography>
				<Button
					variant="text"
					size="small"
					endIcon={<ChevronRightIcon />}
					sx={{
						width: 'fit-content',
						textTransform: 'uppercase',
					}}
				>
					View Report
				</Button>
			</Stack>
			<Box
				sx={{
					marginTop: 'auto',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '80%',
				}}
			>
				{isLoading ? (
					<CircularProgress />
				) : error ? (
					<Typography color="error">Error: {error.message}</Typography>
				) : (
					<PieChart
						series={[
							{
								data: chartData,
								innerRadius: 50,
								outerRadius: 100,
								paddingAngle: 0,
								cornerRadius: 5,
								highlightScope: { faded: 'global', highlighted: 'item' },
								faded: { innerOpacity: 0.3, outerOpacity: 0.3 },
								dataKey: 'value',
							},
						]}
						width={400}
						height={300}
					/>
				)}
			</Box>
		</Card>
	);
}

export default EarningsSection;
