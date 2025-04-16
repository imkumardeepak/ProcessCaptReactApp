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
	Tooltip,
	IconButton,
	Menu,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from '@mui/material';
import {
	DeleteOutlineOutlined,
	ModeEditOutlineOutlined,
	MoreVertOutlined,
	Person3Outlined,
	PersonAddAlt1Outlined,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useApi } from '@/services/machineAPIService';
import useData from '@/utils/hooks/useData';
import CardHeader from '@/components/cardHeader';
import PageHeader from '@/components/pageHeader';
import { enqueueSnackbar } from 'notistack';
import { useAuth } from '@/context/AuthContext';
import DataTable from '@/components/dataTable/Example';
import Modal from '@/components/modal'; // Assuming you have a Modal component
import SuperAdminIndex from './SuperAdminIndex';

function UserManage() {
	const { user } = useAuth();

	if (user?.role === 'SUPERADMIN') {
		return <SuperAdminIndex />;
	}
	return (
		<>
			<PageHeader title="User Management">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Masters</Typography>
					<Typography color="text.secondary">User Management</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<DataTableSection name="User Management" endpoint="UserManage" />
			</Box>
		</>
	);
}

function DataTableSection({ name, endpoint }) {
	const { fetchData, deleteResource } = useApi();
	const { data, isLoading, error, refetch } = useData(endpoint, () => fetchData(endpoint));
	const [dialogState, setDialogState] = useState({ open: false, type: '', operation: null });
	const [menuAnchor, setMenuAnchor] = useState(null);
	const [deleteId, setDeleteId] = useState(null);

	const handleMenuOpen = (event, row) => {
		setMenuAnchor(event.currentTarget);
		setDialogState((prev) => ({ ...prev, operation: row }));
	};

	const handleMenuClose = () => {
		setMenuAnchor(null);
	};

	const openDeleteDialog = (id) => {
		setDeleteId(id);
	};

	const closeDeleteDialog = () => {
		setDeleteId(null);
	};

	const handleDelete = async () => {
		try {
			await deleteResource(endpoint, deleteId);
			refetch();
			enqueueSnackbar('User deleted successfully', { variant: 'success' });
		} catch (error) {
			console.error(error);
			enqueueSnackbar('Failed to delete user', { variant: 'error' });
		} finally {
			closeDeleteDialog();
		}
	};

	const openFormModal = (type, operation) => {
		setDialogState({ open: true, type, operation });
	};

	const closeFormModal = () => {
		setDialogState({ open: false, type: '', operation: null });
		refetch();
	};

	const columns = [
		{ accessorKey: 'name', header: 'User Name', size: 200 },
		{ accessorKey: 'email', header: 'User Email', size: 300 },
		{ accessorKey: 'role', header: 'Designation', size: 200 },
		{ accessorKey: 'qrcode', header: 'Login Code', size: 200 },
		{
			header: 'Actions',
			size: 200,
			Cell: ({ row }) => (
				<Tooltip title="Actions">
					<IconButton onClick={(e) => handleMenuOpen(e, row.original)}>
						<MoreVertOutlined />
					</IconButton>
				</Tooltip>
			),
		},
	];

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
			<CardHeader title={name} subtitle="Manage and view user details here." size="medium" sx={{ padding: 1 }}>
				<Button
					startIcon={<PersonAddAlt1Outlined />}
					variant="contained"
					onClick={() => openFormModal('add', null)}
				>
					New User
				</Button>
			</CardHeader>
			<DataTable columns={columns} data={data} />

			{/* Action Menu */}
			<Menu
				anchorEl={menuAnchor}
				open={Boolean(menuAnchor)}
				onClose={handleMenuClose}
				onClick={(e) => e.stopPropagation()}
			>
				<MenuItem
					onClick={() => {
						handleMenuClose();
						openFormModal('edit', dialogState.operation);
					}}
				>
					<ModeEditOutlineOutlined color="warning" fontSize="small" sx={{ mr: 1 }} />
					Edit
				</MenuItem>
				<MenuItem
					onClick={() => {
						openDeleteDialog(dialogState.operation?.id);
						handleMenuClose();
					}}
				>
					<DeleteOutlineOutlined color="error" fontSize="small" sx={{ mr: 1 }} />
					Delete
				</MenuItem>
			</Menu>

			{/* Delete Confirmation Dialog */}
			<Dialog open={!!deleteId} onClose={closeDeleteDialog}>
				<DialogTitle>Confirm Deletion</DialogTitle>
				<DialogContent>Are you sure you want to delete this user?</DialogContent>
				<DialogActions>
					<Button onClick={closeDeleteDialog}>Cancel</Button>
					<Button onClick={handleDelete} color="error" variant="contained">
						Delete
					</Button>
				</DialogActions>
			</Dialog>

			{/* User Form Modal */}
			{dialogState.open && (
				<UserManageForm
					endpoint={endpoint}
					userDetails={dialogState.operation}
					onClose={closeFormModal}
					type={dialogState.type}
				/>
			)}
		</Card>
	);
}

function UserManageForm({ endpoint, userDetails, onClose, type }) {
	const { fetchData, createResource, updateResource } = useApi();
	const [EmployeeMasters, setEmployeeMasters] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const { user } = useAuth();

	useEffect(() => {
		const fetchEmployeeMasters = async () => {
			try {
				const data = await fetchData('EmployeeMasters');
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
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
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

	useEffect(() => {
		if (userDetails) {
			setValue('empEmail', userDetails.email);
			setValue('empName', userDetails.name);
			setValue('designation', userDetails.role);
			setValue('empMobile', userDetails.empMobile || '');
			setValue('qrcode', userDetails.qrcode || '');
		}
	}, [userDetails, setValue]);

	const onSubmit = async (formData) => {
		if (formData.password !== formData.confirmPassword) {
			enqueueSnackbar('Passwords do not match.', { variant: 'error' });
			return;
		}

		try {
			const userData = {
				compcode: user.compcode,
				plantcode: user.plantcode,
				id: userDetails?.id || 0,
				role: formData.designation || 'ADMIN',
				qrcode: formData.qrcode || '',
				email: formData.empEmail,
				password: formData.password,
				name: formData.empName,
				confirmPassword: formData.confirmPassword,
				newPassword: formData.password,
			};
			console.log(userData);
			if (type === 'add') {
				const result = await createResource(endpoint, userData);
				if (result) {
					enqueueSnackbar('User created successfully!', { variant: 'success' });
					reset();
					return;
				}
				enqueueSnackbar('User Already Exists', { variant: 'error' });
				reset();
			} else if (type === 'edit') {
				const result = await updateResource(endpoint, userDetails.id, userData);
				if (result) {
					enqueueSnackbar('User updated successfully!', { variant: 'success' });
					reset();
					return;
				}
				enqueueSnackbar('Failed to update user', { variant: 'error' });
			}
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
		<Modal openModal fnCloseModal={onClose} title={type === 'edit' ? 'Edit User' : 'New User'} maxWidth="md">
			<Card>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Box>
						<Grid container spacing={2}>
							<Grid item xs={12} sm={6} md={6}>
								<Controller
									name="empEmail"
									control={control}
									defaultValue=""
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
		</Modal>
	);
}

export default UserManage;
