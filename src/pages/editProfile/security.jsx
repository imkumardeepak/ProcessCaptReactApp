import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CardHeader from '@/components/cardHeader';
import { LockOpenOutlined } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { enqueueSnackbar } from 'notistack';

function Security() {
	return (
		<Stack spacing={6}>
			<PasswordSection />
		</Stack>
	);
}

function PasswordSection() {
	const { user, logout } = useAuth();
	const API_BASE_URL = import.meta.env.VITE_APP_API_URL;
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [currentPassword, setCurrentPassword] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [currentPasswordError, setCurrentPasswordError] = useState(''); // New state for current password validation

	if (!user) {
		logout();
		enqueueSnackbar('Session expired. Please login again', { variant: 'warning' });
	}

	const changePassword = async (e) => {
		e.preventDefault();
		setPasswordError(''); // Clear previous password error
		setCurrentPasswordError(''); // Clear previous current password error

		if (!user) {
			logout();
			enqueueSnackbar('Session expired. Please login again', { variant: 'warning' });
		}
		console.log(user);

		if (!currentPassword && !newPassword && !confirmPassword) {
			setCurrentPasswordError('Fill all the fields');
			return;
		}

		if (newPassword !== confirmPassword) {
			setPasswordError('New Password and Confirm Password do not match.');
			return;
		}

		if (currentPassword !== user?.password) {
			setCurrentPasswordError('Incorrect current password.');
			return;
		}
		const getAuthToken = () => sessionStorage.getItem('authToken');
		try {
			const token = getAuthToken();
			console.log(token);
			const response = await fetch(`${API_BASE_URL}/Auth/updatePassword`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					currentPassword: currentPassword,
					newPassword: newPassword,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				const errorMessage = errorData.message || 'Failed to change password';
				throw new Error(errorMessage);
			}

			enqueueSnackbar('Password changed successfully!', { variant: 'success' });
			// Optionally, clear the input fields
			setNewPassword('');
			setConfirmPassword('');
			setCurrentPassword('');
		} catch (error) {
			enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
		}
	};

	return (
		<Card type="section">
			<CardHeader title="Change Password" subtitle="Update Profile Security" />
			<Stack spacing={3}>
				<Alert severity="warning">
					<AlertTitle>Alert!</AlertTitle>
					Your Password will expire in every 1 Year. So change it periodically.
					<b> Do not share your password</b>
				</Alert>
				<form onSubmit={changePassword}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6} md={6}>
							<TextField
								label="New Password"
								variant="outlined"
								type="password"
								fullWidth
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								error={!!passwordError}
								helperText={passwordError}
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={6}>
							<TextField
								label="Confirm Password"
								variant="outlined"
								type="password"
								fullWidth
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								error={!!passwordError}
								helperText={passwordError}
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={6}>
							<TextField
								label="Current Password"
								variant="outlined"
								type="password"
								fullWidth
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								error={!!currentPasswordError}
								helperText={currentPasswordError}
							/>
						</Grid>

						{/* Display error message if passwords do not match */}
						{passwordError && (
							<Grid item xs={12}>
								<Alert severity="error">{passwordError}</Alert>
							</Grid>
						)}

						<Grid item xs={12} sm={12} md={12}>
							<Button
								disableElevation
								endIcon={<LockOpenOutlined />}
								variant="contained"
								sx={{
									float: 'right',
								}}
								type="submit"
							>
								Change Password
							</Button>
						</Grid>
					</Grid>
				</form>
			</Stack>
		</Card>
	);
}

export default Security;
