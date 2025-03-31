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
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/services/machineAPIService';

function DesignationMaster() {
	return (
		<>
			<PageHeader title="Designation Master">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Masters</Typography>
					<Typography color="text.secondary">Designation Master</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<DataTableSection name="Designation Details" endpoint="DesignationMasters" />
			</Box>
		</>
	);
}

function DataTableSection({ endpoint }) {
	const { fetchData, deleteResource } = useApi();
	const { data, isLoading, error, refetch } = useData(endpoint, () => fetchData(endpoint));
	const [dialogState, setDialogState] = useState({ open: false, type: '', designation: null });
	const [menuAnchor, setMenuAnchor] = useState(null);
	const [deleteId, setDeleteId] = useState(null);

	// Open Menu
	const handleMenuOpen = (event, row) => {
		setMenuAnchor(event.currentTarget);
		setDialogState((prev) => ({ ...prev, designation: row }));
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

	// Handle Deletion
	const handleDelete = async () => {
		try {
			await deleteResource(endpoint, deleteId, refetch);
			enqueueSnackbar('Designation deleted successfully', { variant: 'success' });
		} catch (error) {
			enqueueSnackbar('Failed to delete designation', { variant: 'error' });
		} finally {
			closeDeleteDialog();
		}
	};

	// Handle Form Modal
	const openFormModal = (type, designation) => {
		setDialogState({ open: true, type, designation });
	};

	const closeFormModal = () => {
		setDialogState({ open: false, type: '', designation: null });
		refetch();
	};

	// Table Columns
	const columns = [
		{ accessorKey: 'designationName', header: 'Designation Name', size: 300 },
		{
			accessorKey: 'actions',
			header: 'Actions',
			size: 300,
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
				title="Designation Details"
				subtitle="Manage and view designations here."
				size="medium"
				sx={{ padding: 1 }}
			>
				<Button startIcon={<AddIcon />} variant="contained" onClick={() => openFormModal('add', null)}>
					New Designation
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
						openFormModal('edit', dialogState.designation);
					}}
				>
					<ModeEditOutlineOutlined color="warning" fontSize="small" sx={{ mr: 1 }} />
					Edit
				</MenuItem>
				<MenuItem
					onClick={() => {
						openDeleteDialog(dialogState.designation?.id);
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
				<DialogContent>Are you sure you want to delete this designation?</DialogContent>
				<DialogActions>
					<Button onClick={closeDeleteDialog}>Cancel</Button>
					<Button onClick={handleDelete} color="error" variant="contained">
						Delete
					</Button>
				</DialogActions>
			</Dialog>

			{/* Designation Form Modal */}
			{dialogState.open && (
				<DesignationForm
					designationDetails={dialogState.designation}
					onClose={closeFormModal}
					type={dialogState.type}
				/>
			)}
		</Card>
	);
}

function DesignationForm({ designationDetails, onClose, type }) {
	const { createResource, updateResource } = useApi();
	const {
		register,
		handleSubmit,
		setValue,
		reset,
		formState: { errors },
	} = useForm();
	const { user } = useAuth();
	useEffect(() => {
		reset(designationDetails || { designationName: '' });
	}, [designationDetails, reset]);

	const onSubmit = async (data) => {
		try {
			const isEditMode = type === 'edit';
			const updatedData = {
				...data,
				plantcode: user.plantcode,
				compcode: user.compcode,
			};

			const action = isEditMode
				? updateResource('DesignationMasters', designationDetails.id, updatedData)
				: createResource('DesignationMasters', updatedData);

			const successMessage = isEditMode ? 'Designation updated successfully' : 'Designation created successfully';

			const result = await action; // Execute the corresponding action (create or update)

			if (result) {
				enqueueSnackbar(successMessage, { variant: 'success' });
				onClose();
				return;
			}

			enqueueSnackbar('Failed to save designation', { variant: 'error' });
		} catch (error) {
			enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
		}
	};

	return (
		<Modal
			openModal
			fnCloseModal={onClose}
			title={type === 'edit' ? 'Edit Designation' : 'New Designation'}
			maxWidth="xs"
		>
			<Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2 }}>
				<Grid container spacing={2}>
					{/* Company Code */}

					{/* Designation Name */}
					<Grid item xs={12} sm={12}>
						<TextField
							label="Designation Name"
							{...register('designationName', { required: 'Designation name is required' })}
							fullWidth
							margin="normal"
							error={!!errors.designationName}
							helperText={errors.designationName?.message}
							onChange={(e) => {
								// Convert value to uppercase before setting it in the form
								setValue('designationName', e.target.value.toUpperCase());
							}}
						/>
					</Grid>
				</Grid>

				{/* Submit Buttons */}
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

export default DesignationMaster;
