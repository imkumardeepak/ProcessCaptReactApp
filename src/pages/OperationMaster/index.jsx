// src/pages/OperationMaster.js

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

function OperationMaster() {
	return (
		<>
			<PageHeader title="Operation Master">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Masters</Typography>
					<Typography color="text.secondary">Operation Master</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<DataTableSection name="Operation Master" endpoint="OperationMasters" />
			</Box>
		</>
	);
}

function DataTableSection({ endpoint }) {
	const { fetchData, deleteResource } = useApi();
	const { data, isLoading, error, refetch } = useData(endpoint, () => fetchData(endpoint));
	const [dialogState, setDialogState] = useState({ open: false, type: '', operation: null });
	const [menuAnchor, setMenuAnchor] = useState(null);
	const [deleteId, setDeleteId] = useState(null);

	// Open Menu
	const handleMenuOpen = (event, row) => {
		setMenuAnchor(event.currentTarget);
		setDialogState((prev) => ({ ...prev, operation: row }));
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
			enqueueSnackbar('Operation deleted successfully', { variant: 'success' });
		} catch (error) {
			enqueueSnackbar('Failed to delete operation', { variant: 'error' });
		} finally {
			closeDeleteDialog();
		}
	};

	// Handle Form Modal
	const openFormModal = (type, operation) => {
		setDialogState({ open: true, type, operation });
	};

	const closeFormModal = () => {
		setDialogState({ open: false, type: '', operation: null });
		refetch();
	};

	// Table Columns
	const columns = [
		{ accessorKey: 'id', header: 'ID', size: 220 },
		{ accessorKey: 'operationDesc', header: 'Operation Description', size: 300 },
		{ accessorKey: 'operationkey', header: 'Operation Key', size: 200 },
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
				title="Operation Details"
				subtitle="Manage and view operation details here."
				size="medium"
				sx={{ padding: 1 }}
			>
				<Button startIcon={<AddIcon />} variant="contained" onClick={() => openFormModal('add', null)}>
					New Operation
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
				<DialogContent>Are you sure you want to delete this operation?</DialogContent>
				<DialogActions>
					<Button onClick={closeDeleteDialog}>Cancel</Button>
					<Button onClick={handleDelete} color="error" variant="contained">
						Delete
					</Button>
				</DialogActions>
			</Dialog>

			{/* Operation Form Modal */}
			{dialogState.open && (
				<OperationForm
					operationDetails={dialogState.operation}
					onClose={closeFormModal}
					type={dialogState.type}
				/>
			)}
		</Card>
	);
}

function OperationForm({ operationDetails, onClose, type }) {
	const { updateResource, createResource } = useApi();
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm();

	useEffect(() => {
		reset(operationDetails || { compcode: '', plantcode: '', operationDesc: '', operationkey: '' });
	}, [operationDetails, reset]);

	const { user } = useAuth();
	const onSubmit = async (data) => {
		try {
			const isEditMode = type === 'edit';

			const updatedData = {
				...data,
				operationDesc: data.operationDesc.toUpperCase(),
				operationkey: data.operationkey.toUpperCase(),
				plantcode: user.plantcode,
				compcode: user.compcode,
			};
			const action = isEditMode
				? updateResource('OperationMasters', operationDetails.id, updatedData)
				: createResource('OperationMasters', updatedData);

			const successMessage = isEditMode ? 'Operation updated successfully' : 'Operation created successfully';

			const result = await action;

			if (result) {
				enqueueSnackbar(successMessage, { variant: 'success' });
				onClose();
				return;
			}

			enqueueSnackbar('Operation Already Exists', { variant: 'error' });
		} catch (error) {
			enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
		}
	};

	return (
		<Modal
			openModal
			fnCloseModal={onClose}
			title={type === 'edit' ? 'Edit Operation' : 'New Operation'}
			maxWidth="xs"
		>
			<Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2 }}>
				<Grid container spacing={2}>
					{/* Operation Description */}
					<Grid item xs={12}>
						<TextField
							label="Operation Description"
							{...register('operationDesc', { required: 'Description is required' })}
							fullWidth
							margin="normal"
							error={!!errors.operationDesc}
							helperText={errors.operationDesc?.message}
						/>
					</Grid>

					{/* Operation Key */}
					<Grid item xs={12}>
						<TextField
							label="Operation Key"
							{...register('operationkey', { required: 'Operation key is required' })}
							fullWidth
							margin="normal"
							error={!!errors.operationkey}
							helperText={errors.operationkey?.message}
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

export default OperationMaster;
