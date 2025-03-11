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
	FormControl,
	InputLabel,
	Select,
	Checkbox,
	OutlinedInput,
} from '@mui/material';
import {
	Add as AddIcon,
	ModeEditOutlineOutlined,
	DeleteOutlineOutlined,
	MoreHoriz as MoreVertIcon,
} from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
import PageHeader from '@/components/pageHeader';
import CardHeader from '@/components/cardHeader';
import Modal from '@/components/modal';
import useData from '@/utils/hooks/useData';
import DataTable from '@/components/dataTable/Example';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import 'jspdf-autotable'; // Import autotable plugin
import { ImFileWord } from 'react-icons/im';
import { saveAs } from 'file-saver'; // Import file-saver
import { useApi } from '@/services/machineAPIService';

const OCRB_FONT = '../../assets/font//OCRB Medium.ttf';

function Home() {
	return (
		<>
			<PageHeader title="Machine Master">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Masters</Typography>
					<Typography color="text.secondary">Machine Master</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<DataTableSection name="Machine Details" endpoint="MachineDetails" />
			</Box>
		</>
	);
}

function DataTableSection({ name, endpoint }) {
	const { fetchData, deleteResource } = useApi();
	const { data, isLoading, error, refetch } = useData(endpoint, () => fetchData(endpoint));
	const [dialogState, setDialogState] = useState({ open: false, type: '', machine: null });
	const [menuAnchor, setMenuAnchor] = useState(null);
	const [selectedMachine, setSelectedMachine] = useState(null);
	const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleteId, setDeleteId] = useState(null);

	const handleMenuOpen = (event, row) => {
		setMenuAnchor(event.currentTarget);
		setSelectedMachine(row);
	};

	const handleMenuClose = () => {
		setMenuAnchor(null);
		setSelectedMachine(null);
	};

	const openDeleteDialog = (id) => {
		setDeleteId(id);
		setDeleteDialogOpen(true);
	};

	const closeDeleteDialog = () => {
		setDeleteId(null);
		setDeleteDialogOpen(false);
	};

	const handleDelete = async () => {
		try {
			await deleteResource(endpoint, deleteId, refetch);
			enqueueSnackbar('Machine deleted successfully', { variant: 'success' });
		} catch (error) {
			enqueueSnackbar('Failed to delete machine', { variant: 'error' });
		} finally {
			closeDeleteDialog();
		}
	};

	const generateWordFile = () => {
		// Construct the document content with OCR-B font style
		const machineCodes = data.map((item) => `<p>${item.machineID}  |  ${item.machineCode}</p>`).join('\n');

		// Construct the complete HTML document
		const htmlContent = `
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Machine Codes</title>
                 <style>
                    @font-face {
                        font-family: "OCRB";
                        src: url(${OCRB_FONT}) format("truetype"); 
                        font-style: normal;
                    }
						html {
							font-family: "OCRB";
							font-size: 30px;
						}
                </style>
            </head>
            <body>
                ${machineCodes}
            </body>
            </html>
        `;

		// Create a blob with the HTML content
		const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });

		// Save the blob as a .doc file (Word can open .html files)
		saveAs(blob, 'machine_codes.doc');
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

	const columns = [
		{ accessorKey: 'id', header: 'ID', size: 100 },
		{ accessorKey: 'machineID', header: 'Machine ID', size: 150 },
		{ accessorKey: 'machineCode', header: 'Machine Code', size: 150 },
		{ accessorKey: 'operation', header: 'Operation', size: 300 },
		{ accessorKey: 'operationCode', header: 'Operation Code', size: 190 },
		{
			accessorKey: 'actions',
			header: 'Actions',
			size: 150,
			enableColumnFilter: false,
			enableSorting: false,
			enableResizing: false,
			enableGrouping: false,
			enableHiding: false,

			Cell: ({ row }) => (
				<Tooltip title="Actions">
					<IconButton onClick={(e) => handleMenuOpen(e, row.original)}>
						<MoreVertIcon />
					</IconButton>
				</Tooltip>
			),
		},
	];

	return (
		<Card>
			<CardHeader title={name} subtitle="Manage and view machine details here." size="medium" sx={{ padding: 1 }}>
				<Box display="flex">
					<Button
						startIcon={<AddIcon />}
						variant="contained"
						onClick={() => setDialogState({ open: true, type: 'add', machine: null })}
						sx={{ mr: 2 }}
					>
						New Machine
					</Button>
					<Button variant="contained" onClick={generateWordFile} startIcon={<ImFileWord />}>
						Export Scan Code
					</Button>
				</Box>
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
					onClick={(e) => {
						e.stopPropagation();
						handleMenuClose();
						setDialogState({ open: true, type: 'edit', machine: selectedMachine });
					}}
				>
					<ModeEditOutlineOutlined color="warning" fontSize="small" style={{ marginRight: 8 }} />
					Edit
				</MenuItem>

				<MenuItem
					onClick={() => {
						openDeleteDialog(selectedMachine?.id);
						handleMenuClose();
					}}
				>
					<DeleteOutlineOutlined fontSize="small" sx={{ mr: 1 }} color="error" />
					Delete
				</MenuItem>
			</Menu>

			{/* Delete Confirmation Dialog */}
			<Dialog open={isDeleteDialogOpen} onClose={closeDeleteDialog}>
				<DialogTitle>Confirm Deletion</DialogTitle>
				<DialogContent>Are you sure you want to delete this machine?</DialogContent>
				<DialogActions>
					<Button onClick={closeDeleteDialog}>Cancel</Button>
					<Button onClick={handleDelete} color="error" variant="contained">
						Delete
					</Button>
				</DialogActions>
			</Dialog>

			{/* Machine Form Modal */}
			{dialogState.open && (
				<MachineForm
					machineDetails={dialogState.machine}
					onClose={() => {
						setDialogState({ open: false, type: '', machine: null });
						refetch();
					}}
				/>
			)}
		</Card>
	);
}

function MachineForm({ machineDetails, onClose }) {
	const { fetchData, createResource, updateResource } = useApi();
	const fetchOperations = async () => {
		try {
			const data = await fetchData('OperationMasters');
			return data;
		} catch (error) {
			console.error('Error fetching operations:', error);
			throw error;
		}
	};

	const { data: operations, isLoading: loadingOperations } = useQuery({
		queryKey: ['operations'],
		queryFn: fetchOperations,
		onError: (error) => {
			enqueueSnackbar(`Failed to fetch operations ${error}`, { variant: 'error' });
		},
	});

	const {
		register,
		handleSubmit,
		reset,
		control,
		watch,
		formState: { errors },
	} = useForm();

	const { user } = useAuth();

	useEffect(() => {
		if (machineDetails) {
			const operationCodesArray = machineDetails.operationCode.split(',').map((op) => op.trim());
			reset({
				compcode: machineDetails.compcode,
				plantcode: machineDetails.plantcode,
				machineID: machineDetails.machineID,
				machineCode: machineDetails.machineCode,
				machineDescp: machineDetails.machineDescp,
				operationCodes: operationCodesArray,
			});
		} else {
			reset({
				compcode: '',
				plantcode: '',
				machineID: '',
				machineCode: '',
				machineDescp: '',
				operation: '',
				operationCode: '',
				operationCodes: [],
			});
		}
	}, [machineDetails, reset]);

	const onSubmit = async (data) => {
		try {
			const isEditMode = !!machineDetails?.id;

			// Prepare the data for submission
			const selectedOperationKeys = data.operationCodes; // This is an array of selected operation keys
			const selectedOperationDescs = selectedOperationKeys.map(
				(key) => operations.find((op) => op.operationkey === key)?.operationDesc || '',
			);

			const updatedData = {
				id: isEditMode ? machineDetails.id : 0, // Set ID to 0 for new entries
				compcode: user.compcode,
				plantcode: user.plantcode,
				machineID: data.machineID,
				machineCode: data.machineCode,
				machineDescp: data.machineDescp,
				operation: selectedOperationDescs.join(', '), // Join selected operation descriptions as a comma-separated string
				operationCode: selectedOperationKeys.join(', '), // Join selected operation keys as a comma-separated string
			};

			const action = isEditMode
				? updateResource('MachineDetails', machineDetails.id, updatedData)
				: createResource('MachineDetails', updatedData);

			const successMessage = isEditMode ? 'Machine updated successfully' : 'Machine created successfully';

			const result = await action; // Execute the corresponding action (create or update)

			if (result) {
				enqueueSnackbar(successMessage, { variant: 'success' });
				onClose();
				return;
			}

			enqueueSnackbar('Failed to save machine', { variant: 'error' });
		} catch (error) {
			enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
		}
	};

	return (
		<Modal openModal fnCloseModal={onClose} title={machineDetails ? 'Edit Machine' : 'New Machine'} maxWidth="xs">
			<Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2 }}>
				<TextField
					label="Machine ID"
					{...register('machineID', { required: 'Machine ID is required' })}
					error={!!errors.machineID}
					helperText={errors.machineID?.message}
					fullWidth
					margin="normal"
				/>
				<TextField
					label="Machine Code"
					{...register('machineCode', { required: 'Machine code is required' })}
					fullWidth
					margin="normal"
					error={!!errors.machineCode}
					helperText={errors.machineCode?.message}
				/>
				<TextField
					label="Description"
					{...register('machineDescp')}
					error={!!errors.machineDescp}
					helperText={errors.machineDescp?.message}
					fullWidth
					margin="normal"
				/>

				{/* Multiple Select for Operations */}
				<FormControl fullWidth margin="normal">
					<InputLabel id="operation-label">Operations</InputLabel>
					<Controller
						control={control}
						name="operationCodes"
						render={({ field }) => (
							<Select
								labelId="operation-label"
								multiple
								{...register('operationCodes', { required: 'Operations is required' })}
								error={!!errors.operationCodes}
								helperText={errors.operationCodes?.message}
								input={<OutlinedInput label="Operations" />}
								value={field.value || []} // Ensure value is always an array
								onChange={(event) => field.onChange(event.target.value)}
								renderValue={(selected) =>
									loadingOperations
										? ''
										: selected
												.map(
													(value) =>
														operations.find((op) => op.operationkey === value)
															?.operationDesc || '',
												)
												.join(', ')
								}
							>
								{!loadingOperations ? (
									operations.map((operation) => (
										<MenuItem key={operation.id} value={operation.operationkey}>
											<Checkbox checked={field.value.includes(operation.operationkey)} />
											{operation.operationDesc}
										</MenuItem>
									))
								) : (
									<CircularProgress />
								)}
							</Select>
						)}
					/>
				</FormControl>

				{/* Operation Code Field */}
				<TextField
					label="Operation Code"
					value={watch('operationCodes')?.join(', ') || ''}
					fullWidth
					margin="normal"
					disabled // Disable this field since it's derived from the selected operations
				/>

				<Box display="flex" justifyContent="flex-end" mt={2}>
					<Button onClick={onClose} sx={{ mr: 2 }}>
						Cancel
					</Button>
					<Button type="submit" variant="contained">
						{machineDetails ? 'Update' : 'Create'}
					</Button>
				</Box>
			</Box>
		</Modal>
	);
}

export default Home;
