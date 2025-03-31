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
import { useApi } from '@/services/machineAPIService';

function PlantDetails() {
	return (
		<>
			<PageHeader title="Plant Master">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Masters</Typography>
					<Typography color="text.secondary">Plant Master</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<DataTableSection name="Plant Details" endpoint="PlantDetails" />
			</Box>
		</>
	);
}

function DataTableSection({ endpoint }) {
	const { fetchData, deleteResource } = useApi();
	const { data, isLoading, error, refetch } = useData(endpoint, () => fetchData(endpoint));
	const [dialogState, setDialogState] = useState({ open: false, type: '', plant: null });
	const [menuAnchor, setMenuAnchor] = useState(null);
	const [deleteId, setDeleteId] = useState(null);

	// Open Menu
	const handleMenuOpen = (event, row) => {
		setMenuAnchor(event.currentTarget);
		setDialogState((prev) => ({ ...prev, plant: row }));
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
			enqueueSnackbar('Plant deleted successfully', { variant: 'success' });
		} catch (error) {
			enqueueSnackbar('Failed to delete plant', { variant: 'error' });
		} finally {
			closeDeleteDialog();
		}
	};

	// Handle Form Modal
	const openFormModal = (type, plant) => {
		setDialogState({ open: true, type, plant });
	};

	const closeFormModal = () => {
		setDialogState({ open: false, type: '', plant: null });
		refetch();
	};

	// Table Columns
	const columns = [
		{ accessorKey: 'compcode', header: 'Company Code', size: 300 },
		{ accessorKey: 'plantcode', header: 'Plant Code', size: 200 },
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
				title="Plant Details"
				subtitle="Manage and view plant details here."
				size="medium"
				sx={{ padding: 1 }}
			>
				<Button startIcon={<AddIcon />} variant="contained" onClick={() => openFormModal('add', null)}>
					New Plant
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
						openFormModal('edit', dialogState.plant);
					}}
				>
					<ModeEditOutlineOutlined color="warning" fontSize="small" sx={{ mr: 1 }} />
					Edit
				</MenuItem>
				<MenuItem
					onClick={() => {
						openDeleteDialog(dialogState.plant?.id);
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
				<DialogContent>Are you sure you want to delete this plant?</DialogContent>
				<DialogActions>
					<Button onClick={closeDeleteDialog}>Cancel</Button>
					<Button onClick={handleDelete} color="error" variant="contained">
						Delete
					</Button>
				</DialogActions>
			</Dialog>

			{/* Plant Form Modal */}
			{dialogState.open && (
				<PlantForm plantDetails={dialogState.plant} onClose={closeFormModal} type={dialogState.type} />
			)}
		</Card>
	);
}

function PlantForm({ plantDetails, onClose, type }) {
	const { updateResource, createResource } = useApi();
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm();

	useEffect(() => {
		reset(plantDetails || { compcode: '', plantcode: '' });
	}, [plantDetails, reset]);

	const onSubmit = async (data) => {
		try {
			const isEditMode = type === 'edit';
			const action = isEditMode
				? updateResource('PlantDetails', plantDetails.id, data)
				: createResource('PlantDetails', data);

			const successMessage = isEditMode ? 'Plant updated successfully' : 'Plant created successfully';

			const result = await action;

			if (result) {
				enqueueSnackbar(successMessage, { variant: 'success' });
				onClose();
				return;
			}

			enqueueSnackbar('Failed to save plant', { variant: 'error' });
		} catch (error) {
			enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
		}
	};

	return (
		<Modal openModal fnCloseModal={onClose} title={type === 'edit' ? 'Edit Plant' : 'New Plant'} maxWidth="xs">
			<Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2 }}>
				<Grid container spacing={2}>
					{/* Company Code */}
					<Grid item xs={12}>
						<TextField
							label="Company Code"
							{...register('compcode', { required: 'Company code is required' })}
							fullWidth
							margin="normal"
							error={!!errors.compcode}
							helperText={errors.compcode?.message}
						/>
					</Grid>

					{/* Plant Code */}
					<Grid item xs={12}>
						<TextField
							label="Plant Code"
							{...register('plantcode', { required: 'Plant code is required' })}
							fullWidth
							margin="normal"
							error={!!errors.plantcode}
							helperText={errors.plantcode?.message}
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

export default PlantDetails;
