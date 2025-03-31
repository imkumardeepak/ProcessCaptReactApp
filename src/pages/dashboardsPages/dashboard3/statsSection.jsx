import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton'; // Import Skeleton
import Snackbar from '@mui/material/Snackbar'; // Import Snackbar
import Button from '@mui/material/Button'; // Import Button
import {
	AssignmentTurnedInOutlined,
	ChildFriendlyOutlined,
	ContentPasteSearchOutlined,
	FactCheckOutlined,
	FireTruckOutlined,
	HourglassBottomOutlined,
	HourglassFullOutlined,
	ListAltOutlined,
	MoveDownOutlined,
	PlaylistAddCheckOutlined,
} from '@mui/icons-material';
import { useApi } from '@/services/machineAPIService';
import useData from '@/utils/hooks/useData';
import { useEffect, useState } from 'react';

function StatsSection() {
	const { fetchData } = useApi();
	const { data: usersData, isLoading, error } = useData('Dashboard', () => fetchData('Home/GetOverallView')); // Fetch employee data
	const [displayData, setDisplayData] = useState([]);
	const [snackbarOpen, setSnackbarOpen] = useState(false);

	useEffect(() => {
		if (usersData) {
			setDisplayData(usersData);
		} else {
			setDisplayData([]);
		}
	}, [usersData]);

	useEffect(() => {
		if (error) {
			setSnackbarOpen(true); // Open snackbar if there's an error
		}
	}, [error]);

	const handleCloseSnackbar = () => {
		setSnackbarOpen(false);
	};

	const STATS_DATA = [
		{
			id: 1,
			color: '#006BFF',
			name: 'Planning Release',
			total: displayData.planningReleaseRoutesheet || 0, // Default to 0 if undefined
			Icon: ListAltOutlined,
		},
		{
			id: 2,
			color: '#6A42C2',
			name: 'Shop Floor Release',
			total: displayData.shopReleaseRouteshhet || 0, // Default to 0 if undefined
			Icon: PlaylistAddCheckOutlined,
		},
		{
			id: 3,
			color: '#FAB12F',
			name: 'Pending Floor Release',
			total: displayData.pendingshopReleaseRouteshhet || 0, // Default to 0 if undefined
			Icon: MoveDownOutlined,
		},
		{
			id: 4,
			color: '#347928',
			name: 'Completed Routesheet',
			total: displayData.completedRoutesheet || 0, // Default to 0 if undefined
			Icon: AssignmentTurnedInOutlined,
		},
		{
			id: 5,
			color: '#EB8317',
			name: 'QCF Pending',
			total: displayData.qcFpENDINGroutesheet || 0, // Default to 0 if undefined
			Icon: FactCheckOutlined,
		},
		{
			id: 6,
			color: '#205781',
			name: 'Galava-IN Pending',
			total: displayData.galvaINpENDINGroutesheet || 0, // Default to 0 if undefined
			Icon: ChildFriendlyOutlined,
		},
		{
			id: 7,
			color: '#E50046',
			name: 'QCG Pending',
			total: displayData.qcGpENDINGroutesheet || 0, // Default to 0 if undefined
			Icon: ContentPasteSearchOutlined,
		},
		{
			id: 8,
			color: '#1D1616',
			name: 'RFD Pending',
			total: displayData.rfdendinGroutesheet || 0, // Default to 0 if undefined
			Icon: FireTruckOutlined,
		},
	];

	return (
		<section>
			<Grid container spacing={2}>
				{STATS_DATA.map((stat) => (
					<Grid item xs={12} sm={6} md={3} key={stat.id}>
						{isLoading ? ( // Show skeleton if loading
							<Skeleton variant="rectangular" height={100} animation="wave" />
						) : (
							<StatSection statData={stat} />
						)}
					</Grid>
				))}
			</Grid>

			{/* Snackbar for error messages */}
			<Snackbar
				open={snackbarOpen}
				autoHideDuration={6000}
				onClose={handleCloseSnackbar}
				message="An error occurred while fetching data."
				action={<Button onClick={handleCloseSnackbar}>Close</Button>}
			/>
		</section>
	);
}

function StatSection({ statData }) {
	const { name, total, color, Icon } = statData;

	return (
		<Card>
			<Stack direction="row" spacing={1} alignItems="center">
				<Icon
					sx={{
						fontSize: 50,
						color,
					}}
					color="disabled"
				/>
				<span>
					<Typography fontSize={25} variant="subtitle1">
						{total.toLocaleString()} {/* Directly show total */}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{name}
					</Typography>
				</span>
			</Stack>
		</Card>
	);
}

export default StatsSection;
