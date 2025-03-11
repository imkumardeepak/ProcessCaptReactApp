import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import CardHeader from '@/components/cardHeader';
import { enqueueSnackbar } from 'notistack';
import { useApi } from '@/services/machineAPIService';
import { useAuth } from '@/context/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import useData from '@/utils/hooks/useData';

function Profile() {
	return (
		<Stack spacing={6}>
			<ProfileSection />
		</Stack>
	);
}

function ProfileSection() {
	const { fetchData } = useApi();
	const { user } = useAuth();
	const { data, isLoading, error, refetch } = useData('EmployeeMasters', () =>
		fetchData(`EmployeeMasters/${user.qrcode}`),
	);

	if (error) {
		<Box>{error.message}</Box>;
	}
	return (
		<Card type="section">
			<CardHeader title="Profile Information" />
			<Stack>
				{isLoading ? (
					<CircularProgress /> // Show loading spinner while fetching data
				) : (
					<Grid container spacing={3}>
						<Grid item xs={12} sm={6} md={6}>
							<TextField
								label="Name"
								variant="outlined"
								value={data ? data.empName : ''} // Bind name from employee data
								fullWidth
								InputProps={{ readOnly: true }} // Make read-only
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={6}>
							<TextField
								type="email"
								label="Account Email"
								variant="outlined"
								value={data ? data.empEmail : ''} // Bind email from employee data
								fullWidth
								InputProps={{ readOnly: true }} // Make read-only
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={6}>
							<TextField
								label="Company Code"
								variant="outlined"
								value={data ? data.compcode : ''} // Bind company code from employee data
								fullWidth
								InputProps={{ readOnly: true }} // Make read-only
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={6}>
							<TextField
								label="Plant Code"
								variant="outlined"
								value={data ? data.plantcode : ''} // Bind plant code from employee data
								fullWidth
								InputProps={{ readOnly: true }} // Make read-only
							/>
						</Grid>

						<Grid item xs={12} sm={6} md={6}>
							<TextField
								label="Phone Number"
								variant="outlined"
								value={data ? data.empMobile : ''} // Bind phone number from employee data
								fullWidth
								InputProps={{ readOnly: true }} // Make read-only
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={6}>
							<TextField
								label="Designation"
								variant="outlined"
								value={data ? data.designation : ''} // Bind designation from employee data
								fullWidth
								InputProps={{ readOnly: true }} // Make read-only
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={6}>
							<TextField
								label="Login Code"
								variant="outlined"
								value={data ? data.qrcode : ''} // Bind login code from employee data
								fullWidth
								InputProps={{ readOnly: true }} // Make read-only
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={6}>
							<TextField
								label="Site Information"
								variant="outlined"
								value={'https://transrail.in/'} // Bind site info from employee data
								fullWidth
								InputProps={{ readOnly: true }} // Make read-only
							/>
						</Grid>
					</Grid>
				)}
			</Stack>
		</Card>
	);
}

export default Profile;
