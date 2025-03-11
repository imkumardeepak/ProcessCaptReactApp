import React, { useEffect, useState } from 'react';
import {
	Box,
	Breadcrumbs,
	Card,
	TextField,
	Typography,
	Grid,
	Button,
	Select,
	MenuItem,
	CircularProgress,
	FormControl,
	InputLabel,
} from '@mui/material';
import { Person3Outlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useApi } from '@/services/machineAPIService';
import CardHeader from '@/components/cardHeader';
import PageHeader from '@/components/pageHeader';
import { enqueueSnackbar } from 'notistack';
import { useAuth } from '@/context/AuthContext';

function SuperAdminIndex() {
	return (
		<>
			<PageHeader title="User Management">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Masters</Typography>
					<Typography color="text.secondary">User Management</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<SuperAdminForm name="User Management" endpoint="EmployeeMasters" />
			</Box>
		</>
	);
}

function SuperAdminForm({ name, endpoint }) {
	const { fetchData, createResource } = useApi();
	const [EmployeeMasters, setEmployeeMasters] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const { user } = useAuth();

	useEffect(() => {
		const fetchEmployeeMasters = async () => {
			try {
				const data = await fetchData('EmployeeMasters'); // Adjust this API call as needed
				setEmployeeMasters(data);
			} catch (error) {
				setError('Failed to load designations');
			} finally {
				setIsLoading(false);
			}
		};
		fetchEmployeeMasters();
	}, []);

	const {
		control,
		handleSubmit,
		setValue,
		watch,
		reset, // Import reset function
		formState: { errors },
	} = useForm({
		defaultValues: {
			compcode: '',
			plantcode: '',
			empEmail: '',
			empName: '',
			designation: '',
			empMobile: '',
			qrcode: '',
			password: '',
			confirmPassword: '',
		},
	});

	const password = watch('password');

	const onSubmit = async (formData) => {
		if (formData.password !== formData.confirmPassword) {
			enqueueSnackbar('Passwords do not match.', { variant: 'error' });
			return;
		}

		try {
			// Prepare the data to be sent to the API
			const userData = {
				compcode: formData.compcode,
				plantcode: formData.plantcode,
				Role: formData.designation || 'User', // Default role if not provided
				Qrcode: formData.qrcode || '', // Assuming QR code can be empty
				Email: formData.empEmail,
				Password: formData.password,
				Name: formData.empName,
			};

			// Send data to the registration API
			const result = await createResource('Auth/register', userData);

			if (result) {
				enqueueSnackbar('User created successfully!', { variant: 'success' });
				reset(); // Clear the form after successful submission
				return;
			}
			enqueueSnackbar('User Already Exists', { variant: 'error' });
			reset();
		} catch (error) {
			enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
		}
	};

	const handleUserSelect = (event) => {
		const selectedEmail = event.target.value;
		const selectedUser = EmployeeMasters.find((user) => user.empEmail === selectedEmail);

		if (selectedUser) {
			setValue('empName', selectedUser.empName);
			setValue('designation', selectedUser.designation);
			setValue('empMobile', selectedUser.empMobile);
			setValue('qrcode', selectedUser.qrcode);
		}
	};

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" height="100vh">
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" height="100vh">
				<Typography variant="h6" color="error">
					Failed to load data.
				</Typography>
			</Box>
		);
	}

	return (
		<Card>
			<CardHeader
				title={`${name}`}
				subtitle={`Create and view ${name} details here.`}
				size="medium"
				sx={{ padding: 1 }}
			/>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Box>
					<Grid container spacing={3}>
						<Grid item xs={12} sm={6} md={6}>
							<Controller
								name="compcode"
								control={control}
								render={({ field }) => (
									<TextField {...field} label="Company Code" variant="outlined" fullWidth />
								)}
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={6}>
							<Controller
								name="plantcode"
								control={control}
								render={({ field }) => (
									<TextField {...field} label="Plant Code" variant="outlined" fullWidth />
								)}
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={6}>
							<Controller
								name="empEmail"
								control={control}
								defaultValue="" // Add defaultValue to Controller
								render={({ field }) => (
									<FormControl fullWidth>
										<InputLabel id="empEmail-select-label">Select User Email</InputLabel>
										<Select
											{...field}
											labelId="empEmail-select-label"
											id="empEmail-select"
											label="Select User Email"
											onChange={(event) => {
												field.onChange(event);
												handleUserSelect(event);
											}}
											value={field.value || ''}
										>
											{EmployeeMasters ? (
												EmployeeMasters.map((user) => (
													<MenuItem key={user.empEmail} value={user.empEmail}>
														{user.empEmail}
													</MenuItem>
												))
											) : (
												<MenuItem disabled value="">
													Loading...
												</MenuItem>
											)}
										</Select>
									</FormControl>
								)}
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={6}>
							<Controller
								name="empName"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="User Name"
										variant="outlined"
										fullWidth
										InputProps={{
											readOnly: true,
										}}
									/>
								)}
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={6}>
							<Controller
								name="designation"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Designation"
										variant="outlined"
										fullWidth
										InputProps={{
											readOnly: true,
										}}
									/>
								)}
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={6}>
							<Controller
								name="empMobile"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Mobile Number"
										variant="outlined"
										fullWidth
										InputProps={{
											readOnly: true,
										}}
									/>
								)}
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={6}>
							<Controller
								name="qrcode"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Login Code"
										variant="outlined"
										fullWidth
										InputProps={{
											readOnly: true,
										}}
									/>
								)}
							/>
						</Grid>

						{/* Password Field */}
						<Grid item xs={12} sm={6} md={6}>
							<Controller
								name="password"
								control={control}
								rules={{ required: 'Password is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										type="password"
										label="Password"
										variant="outlined"
										fullWidth
										required
										error={!!errors.password}
										helperText={errors.password?.message}
									/>
								)}
							/>
						</Grid>

						{/* Confirm Password Field */}
						<Grid item xs={12} sm={6} md={6}>
							<Controller
								name="confirmPassword"
								control={control}
								rules={{
									required: 'Confirm Password is required',
									validate: (value) => value === password || 'The passwords do not match',
								}}
								render={({ field }) => (
									<TextField
										{...field}
										type="password"
										label="Confirm Password"
										variant="outlined"
										fullWidth
										required
										error={!!errors.confirmPassword}
										helperText={errors.confirmPassword?.message}
									/>
								)}
							/>
						</Grid>

						{/* Save Button */}
						<Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
							<Button variant="contained" sx={{ mt: 1 }} endIcon={<Person3Outlined />} type="submit">
								Save User
							</Button>
						</Grid>
					</Grid>
				</Box>
			</form>
		</Card>
	);
}

export default SuperAdminIndex;
