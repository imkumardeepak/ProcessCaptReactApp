import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useAuth } from '@/context/AuthContext';
import LoginIcon from '@mui/icons-material/Login';
import { enqueueSnackbar } from 'notistack';
import { useForm, Controller } from 'react-hook-form';

function LoginSimple() {
	return (
		<Card
			hover={false}
			elevation={20}
			sx={{
				display: 'block',
				width: {
					xs: '95%',
					sm: '55%',
					md: '35%',
					lg: '25%',
				},
			}}
		>
			<Stack direction="column" spacing={5}>
				<div>
					<Typography variant="h1">SIGN IN</Typography>
					<Typography variant="body2" color="textSecondary">
						Signin using your account credentials.
					</Typography>
				</div>
				<LoginForm />
			</Stack>
		</Card>
	);
}

function LoginForm() {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

	// React Hook Form setup
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm();

	const onSubmit = async (data) => {
		setIsLoading(true);
		try {
			const response = await fetch(`${API_BASE_URL}/Auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				throw new Error('Invalid credentials');
			}
			const { token, user } = await response.json();
			login(token, user);
			navigate('/dashboards/dashboard3');
		} catch (error) {
			console.error('Login failed:', error.message);
			enqueueSnackbar('Login failed. Please check your credentials.', { variant: 'error' });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Controller
				name="email"
				control={control}
				defaultValue=""
				rules={{
					required: 'Email is required',
					pattern: {
						value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
						message: 'Invalid email address',
					},
				}}
				render={({ field }) => (
					<TextField
						{...field}
						autoFocus
						color="primary"
						label="Email"
						margin="normal"
						variant="outlined"
						fullWidth
						error={!!errors.email}
						helperText={errors.email?.message}
					/>
				)}
			/>
			<Controller
				name="password"
				control={control}
				defaultValue=""
				rules={{
					required: 'Password is required',
				}}
				render={({ field }) => (
					<TextField
						{...field}
						color="primary"
						label="Password"
						margin="normal"
						variant="outlined"
						fullWidth
						error={!!errors.password}
						helperText={errors.password?.message}
					/>
				)}
			/>
			<Link to="/pages/qrcode" component={RouterLink} color="tertiary.main">
				Login By Scan Barcode
			</Link>
			<Button
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
				type="submit"
				variant="contained"
				disabled={isLoading}
				endIcon={
					isLoading ? (
						<CircularProgress
							color="secondary"
							size={25}
							sx={{
								my: 'auto',
							}}
						/>
					) : (
						<LoginIcon />
					)
				}
				fullWidth
				color="primary"
			>
				Sign In
			</Button>
		</form>
	);
}

export default LoginSimple;
