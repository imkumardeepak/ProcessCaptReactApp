import React, { useState, useEffect } from 'react';
import {
	List,
	ListItem,
	ListItemButton,
	ListItemAvatar,
	Card,
	Typography,
	Avatar,
	IconButton,
	Tooltip,
	CircularProgress, // Import CircularProgress
	Box, // Import Box
} from '@mui/material';
import CardHeader from '@/components/cardHeader';
import { useApi } from '@/services/machineAPIService';
import useData from '@/utils/hooks/useData';
import { MailOutlineOutlined } from '@mui/icons-material';
import avtar from '../../../assets/images/avatars/man_2.png';

function SuggestedPeople() {
	const { fetchData } = useApi();
	const { data: usersData, isLoading, error } = useData('EmployeeMasters', () => fetchData('EmployeeMasters')); // Fetch employee data
	const [displayData, setDisplayData] = useState([]); // Initialize displayData with an empty array

	useEffect(() => {
		if (usersData && Array.isArray(usersData)) {
			setDisplayData(usersData); // Set displayData when usersData is available and is an array
		} else {
			setDisplayData([]); // Ensure displayData is an empty array if usersData is not an array or is undefined
		}
	}, [usersData]); // Update displayData whenever usersData changes

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" height="200px">
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Typography variant="h6" color="error" align="center">
				Failed to load data.
			</Typography>
		);
	}

	return (
		<Card type="none" sx={{ height: 1 }}>
			<CardHeader
				title="People you may know"
				subtitle="Displaying employee suggestions."
				size="small"
				sx={{
					p: 3,
					pb: 0,
				}}
			/>
			<List
				sx={{
					'& > li:not(:last-child)': {
						borderBottom: 1,
						borderColor: (theme) => theme.palette.border,
					},
				}}
			>
				{displayData.slice(0, 5).map((user) => (
					<UserListItem key={user.id} user={user} />
				))}
			</List>
		</Card>
	);
}

function UserListItem({ user }) {
	const { empName: name, designation: rol, empEmail: avatarImg } = user; // Use employee data fields

	// Function to generate a simple avatar based on the first letter of the name
	const generateAvatar = (name) => {
		const initials = name ? name.charAt(0).toUpperCase() : '';
		return <Avatar>{initials}</Avatar>;
	};

	return (
		<ListItem disablePadding alignItems="flex-start">
			<ListItemButton>
				<ListItemAvatar>
					{avatarImg ? (
						<Avatar alt={name} src={avatarImg} /> // Display image if available
					) : (
						generateAvatar(name) // Generate avatar if no image
					)}
				</ListItemAvatar>
				<span
					style={{
						width: '100%',
					}}
				>
					<Typography variant="subtitle2" fontSize={13} color="primary.main">
						{name}
					</Typography>
					<Typography variant="caption">{rol}</Typography>
				</span>
				<Tooltip title="Mail">
					<IconButton>
						<a href={`mailto:${user.empEmail}`}>
							<MailOutlineOutlined fontSize="small" color="primary" />
						</a>
					</IconButton>
				</Tooltip>
			</ListItemButton>
		</ListItem>
	);
}

export default SuggestedPeople;
