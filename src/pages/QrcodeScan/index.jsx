import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Box, TextField, Button, Typography, Alert, Stack, Container } from '@mui/material';
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

function QRCodeScanner() {
	const navigate = useNavigate();
	const [apierror, setapierror] = useState('');
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
		resetField,
	} = useForm();
	const { login } = useAuth();

	const inputRef = React.useRef(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (inputRef.current) {
				inputRef.current.focus();
			}
		}, 50); // Reduced delay for better UX
		return () => clearTimeout(timer); // Cleanup timer
	}, []);
	const handleScan = async (data) => {
		const { qrCode } = data;

		try {
			// Call the API to validate the QR code and fetch user data
			const response = await axios.get(`${API_BASE_URL}/auth/loginbyqrcode`, {
				params: { qrcode: qrCode },
			});

			const { token, user } = response.data;
			login(token, user); // Use the login function from AuthContext
			navigate('/dashboards/dashboard3');
		} catch (err) {
			let errorMessage = 'Failed to log in. Please check your QR code.';

			// Extract error message from API response if available
			if (err.response && err.response.data) {
				errorMessage = err.response.data.message || 'An error occurred. Please try again.';
			}

			setapierror(errorMessage);
			resetField('qrCode'); // Clear the QR code field on error
		}
	};

	const handleKeyDown = (event, onSubmit) => {
		if (event.key === 'Enter') {
			event.preventDefault(); // Prevent default form submission
			onSubmit();
		}
	};

	return (
		<Container
			maxWidth="sm"
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100vh',
				textAlign: 'center',
			}}
		>
			<Box
				sx={{
					bgcolor: 'white',
					p: 4,
					borderRadius: 2,
					boxShadow: 3,
					width: '100%',
					maxWidth: 400,
				}}
			>
				<Typography variant="h4" mb={4}>
					QR Code Scanner Login
				</Typography>

				<form onSubmit={handleSubmit(handleScan)} noValidate>
					<Stack spacing={2} sx={{ width: '100%' }}>
						<TextField
							label="QR Code"
							variant="outlined"
							inputProps={{
								onKeyDown: (e) => handleKeyDown(e, handleSubmit(handleScan)),
							}}
							fullWidth
							{...register('qrCode', { required: 'Please enter or scan a QR code.' })}
							error={!!errors.qrCode}
							helperText={errors.qrCode?.message}
							onKeyDown={(e) => handleKeyDown(e, handleSubmit(handleScan))}
							inputRef={inputRef}
						/>

						{apierror && <Alert severity="error">{apierror}</Alert>}

						<Button
							type="submit"
							variant="contained"
							color="primary"
							size="large"
							sx={{
								mt: 2,
								textTransform: 'uppercase',
								color: 'primary.contrastText',
								'&:not(:disabled)': {
									background: (theme) =>
										`linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.tertiary.main} 100%)`,
								},
								'&:hover': {
									background: (theme) =>
										`linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.tertiary.dark} 100%)`,
								},
							}}
						>
							Login
						</Button>
					</Stack>
				</form>
			</Box>
		</Container>
	);
}

export default QRCodeScanner;
