import { useState, useEffect } from 'react';
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
	MoveDownOutlined,
	PlaylistAddCheckOutlined,
	ListAltOutlined,
} from '@mui/icons-material';
import { useApi } from '@/services/machineAPIService';
import useData from '@/utils/hooks/useData';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function StatsSection() {
	const { fetchData } = useApi();
	const navigate = useNavigate(); // Initialize navigate
	const { data: usersData, isLoading, error } = useData('Dashboard', () => fetchData('Home/GetOverallView'));
	const [displayData, setDisplayData] = useState([]);
	const [snackbarOpen, setSnackbarOpen] = useState(false);

	useEffect(() => {
		if (usersData) {
			console.log(usersData);
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
			id: 9,
			color: '#205781',
			name: 'Pending Routesheet',
			total: displayData.pendingPlanningReleaseRoutesheet || 0,
			Icon: ContentPasteSearchOutlined,
			redirectTo: '/pages/statusreport', // Add route
		},
		{
			id: 1,
			color: '#006BFF',
			name: 'Planning Release',
			total: displayData.planningReleaseRoutesheet || 0,
			Icon: ListAltOutlined,
			redirectTo: '/pages/statusreport', // Add route
		},
		{
			id: 2,
			color: '#6A42C2',
			name: 'Shop Floor Release',
			total: displayData.shopReleaseRouteshhet || 0,
			Icon: PlaylistAddCheckOutlined,
			redirectTo: '/pages/statusreport', // Add route
		},
		{
			id: 3,
			color: '#FAB12F',
			name: 'Pending Floor Release',
			total: displayData.pendingshopReleaseRouteshhet || 0,
			Icon: MoveDownOutlined,
			redirectTo: '/pages/shopfloorrelease', // Add route
		},
		{
			id: 4,
			color: '#347928',
			name: 'Completed Routesheet',
			total: displayData.completedRoutesheet || 0,
			Icon: AssignmentTurnedInOutlined,
			redirectTo: '/pages/statusreport', // Add route
		},
		{
			id: 5,
			color: '#EB8317',
			name: 'QCF Pending',
			total: displayData.qcFpENDINGroutesheet || 0,
			Icon: FactCheckOutlined,
			redirectTo: '/pages/statusreport', // Add route
		},
		{
			id: 6,
			color: '#205781',
			name: 'Galava-IN Pending',
			total: displayData.galvaINpENDINGroutesheet || 0,
			Icon: ChildFriendlyOutlined,
			redirectTo: '/pages/statusreport', // Add route
		},
		{
			id: 7,
			color: '#E50046',
			name: 'QCG Pending',
			total: displayData.qcGpENDINGroutesheet || 0,
			Icon: ContentPasteSearchOutlined,
			redirectTo: '/pages/statusreport', // Add route
		},
		{
			id: 8,
			color: '#1D1616',
			name: 'RFD Pending',
			total: displayData.rfdendinGroutesheet || 0,
			Icon: FireTruckOutlined,
			redirectTo: '/pages/statusreport', // Add route
		},
	];

	return (
		<section>
			<Grid container spacing={2}>
				{STATS_DATA.map((stat) => (
					<Grid item xs={12} sm={4} md={4} key={stat.id}>
						{isLoading ? (
							<Skeleton variant="rectangular" height={100} animation="wave" />
						) : (
							<StatSection statData={stat} onClick={() => navigate(stat.redirectTo)} /> // Pass onClick handler
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

function StatSection({ statData, onClick }) {
	const { name, total, color, Icon } = statData;

	return (
		<Card onClick={onClick} sx={{ cursor: 'pointer', p: 2 }}>
			{' '}
			{/* Add onClick and pointer cursor */}
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
						{total.toLocaleString()}
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
