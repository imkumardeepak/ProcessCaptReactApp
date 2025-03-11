import React, { useEffect, useState } from 'react';
import {
	Breadcrumbs,
	Typography,
	Box,
	Button,
	CircularProgress,
	Card,
	Menu,
	MenuItem,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Tooltip,
	IconButton,
	TextField,
	Grid,
} from '@mui/material';
import {
	Add as AddIcon,
	ModeEditOutlineOutlined,
	DeleteOutlineOutlined,
	MoreHoriz as MoreVertIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
import PageHeader from '@/components/pageHeader';
import CardHeader from '@/components/cardHeader';
import Modal from '@/components/modal';
import useData from '@/utils/hooks/useData';
import DataTable from '../../components/dataTable/Example'; // Reusable DataTable Component
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/services/machineAPIService';

function ShiftMaster() {
	return (
		<>
			<PageHeader title="Shift Master">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Masters</Typography>
					<Typography color="text.secondary">Shift Master</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<DataTableSection name="Shift Details" endpoint="ShiftMasters" />
			</Box>
		</>
	);
}

function DataTableSection({ endpoint }) {
	const { fetchData, deleteResource } = useApi();
	const { data, isLoading, error, refetch } = useData(endpoint, () => fetchData(endpoint));
	const [dialogState, setDialogState] = useState({ open: false, type: '', shift: null });
	const [menuAnchor, setMenuAnchor] = useState(null);
	const [deleteId, setDeleteId] = useState(null);

	// Open Menu
	const handleMenuOpen = (event, row) => {
		setMenuAnchor(event.currentTarget);
		setDialogState((prev) => ({ ...prev, shift: row }));
	};

	// Close Menu
	const handleMenuClose = () => {
		setMenuAnchor(null);
	};

	// Open Delete Dialog
	const openDeleteDialog = (id) => {
		setDeleteId(id);
	};

	// Close Delete Dialog
	const closeDeleteDialog = () => {
		setDeleteId(null);
	};

	// Handle Shift Deletion
	const handleDelete = async () => {
		try {
			await deleteResource(endpoint, deleteId, refetch);
			enqueueSnackbar('Shift deleted successfully', { variant: 'success' });
		} catch (error) {
			enqueueSnackbar('Failed to delete shift', { variant: 'error' });
		} finally {
			closeDeleteDialog();
		}
	};

	// Handle Form Modal
	const openFormModal = (type, shift) => {
		setDialogState({ open: true, type, shift });
	};

	const closeFormModal = () => {
		setDialogState({ open: false, type: '', shift: null });
		refetch();
	};

	// Table Columns
	const columns = [
		{ accessorKey: 'id', header: 'ID', size: 200 },
		{ accessorKey: 'shiftName', header: 'Shift' },
		{
			accessorKey: 'startTime',
			header: 'Start Time',
			size: 200,
		},
		{
			accessorKey: 'endTime',
			header: 'End Time',
			size: 200,
		},
		{
			accessorKey: 'actions',
			header: 'Actions',
			size: 200,
			enableColumnFilter: false, // Disable filtering
			enableSorting: false, // Disable sorting
			enableResizing: false, // Disable resizing
			enableGrouping: false, // Disable grouping
			enableHiding: false, // Prevent column hiding in the column menu
			cellStyle: { pointerEvents: 'none' }, // Optional: Disable interaction
			Cell: ({ row }) => (
				<Tooltip title="Actions">
					<IconButton onClick={(e) => handleMenuOpen(e, row.original)}>
						<MoreVertIcon />
					</IconButton>
				</Tooltip>
			),
		},
	];

	// Render Loading/Error States
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
				title="Shift Details"
				subtitle="Manage and view shift details here."
				size="medium"
				sx={{ padding: 1 }}
			>
				<Button startIcon={<AddIcon />} variant="contained" onClick={() => openFormModal('add', null)}>
					New Shift
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
						openFormModal('edit', dialogState.shift);
					}}
				>
					<ModeEditOutlineOutlined color="warning" fontSize="small" sx={{ mr: 1 }} />
					Edit
				</MenuItem>
				<MenuItem
					onClick={() => {
						openDeleteDialog(dialogState.shift?.id);
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
				<DialogContent>Are you sure you want to delete this shift?</DialogContent>
				<DialogActions>
					<Button onClick={closeDeleteDialog}>Cancel</Button>
					<Button onClick={handleDelete} color="error" variant="contained">
						Delete
					</Button>
				</DialogActions>
			</Dialog>

			{/* Shift Form Modal */}
			{dialogState.open && (
				<ShiftForm shiftDetails={dialogState.shift} onClose={closeFormModal} type={dialogState.type} />
			)}
		</Card>
	);
}

function ShiftForm({ shiftDetails, onClose, type }) {
	const { updateResource, createResource } = useApi();
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm();
	const { user } = useAuth();
	useEffect(() => {
		reset(shiftDetails || { shiftName: '', startTime: '', endTime: '' });
	}, [shiftDetails, reset]);

	const onSubmit = async (data) => {
		try {
			const updatedData = {
				...data,
				plantcode: user.plantcode,
				compcode: user.compcode,
			};
			const isEditMode = type === 'edit'; // Determine if it's edit mode
			const action = isEditMode
				? updateResource('ShiftMasters', shiftDetails.id, updatedData)
				: createResource('ShiftMasters', updatedData);

			const successMessage = isEditMode ? 'Shift updated successfully' : 'Shift created successfully';

			const result = await action; // Execute the corresponding action (create or update)

			if (result) {
				enqueueSnackbar(successMessage, { variant: 'success' });
				onClose();
				return;
			}

			enqueueSnackbar('Failed to save shift', { variant: 'error' });
		} catch (error) {
			enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
		}
	};

	return (
		<Modal openModal fnCloseModal={onClose} title={type === 'edit' ? 'Edit Shift' : 'New Shift'} maxWidth="xs">
			<Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2 }}>
				<TextField
					label="Shift Name"
					{...register('shiftName', { required: 'Shift name is required' })}
					fullWidth
					margin="normal"
					error={!!errors.shiftName}
					helperText={errors.shiftName?.message}
				/>
				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<Grid container rowSpacing={1} columnSpacing={1}>
						<Grid item xs={12} sm={6}>
							<TimePicker
								label="Start Time"
								value={watch('startTime') ? dayjs(watch('startTime'), 'HH:mm:ss') : null}
								onChange={(value) => setValue('startTime', value?.format('HH:mm:ss') || '')}
								renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TimePicker
								label="End Time"
								value={watch('endTime') ? dayjs(watch('endTime'), 'HH:mm:ss') : null}
								onChange={(value) => setValue('endTime', value?.format('HH:mm:ss') || '')}
								renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
							/>
						</Grid>
					</Grid>
				</LocalizationProvider>
				<Box display="flex" justifyContent="flex-end" mt={2}>
					<Button onClick={onClose} sx={{ mr: 2 }}>
						Cancel
					</Button>
					<Button type="submit" variant="contained">
						{type === 'edit' ? 'Update' : 'Create'}
					</Button>
				</Box>
			</Box>
		</Modal>
	);
}

export default ShiftMaster;
