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
import DesignationSelect from './DesignationSelect';
import { useAuth } from '@/context/AuthContext';
import { saveAs } from 'file-saver';
import { ImFilePdf, ImFileWord } from 'react-icons/im';
import { useApi } from '@/services/machineAPIService';

const OCRB_FONT = '../../assets/font//OCRB Medium.ttf';

function EmployeeMaster() {
	return (
		<>
			<PageHeader title="Employee Master">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Masters</Typography>
					<Typography color="text.secondary">Employee Master</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<DataTableSection name="Employee Details" endpoint="EmployeeMasters" />
			</Box>
		</>
	);
}

function DataTableSection({ endpoint }) {
	const { fetchData, deleteResource } = useApi();
	const { data, isLoading, error, refetch } = useData(endpoint, () => fetchData(endpoint));
	const [dialogState, setDialogState] = useState({ open: false, type: '', employee: null });
	const [menuAnchor, setMenuAnchor] = useState(null);
	const [deleteId, setDeleteId] = useState(null);

	// Open Menu
	const handleMenuOpen = (event, row) => {
		setMenuAnchor(event.currentTarget);
		setDialogState((prev) => ({ ...prev, employee: row }));
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

	// Handle Employee Deletion
	const handleDelete = async () => {
		try {
			await deleteResource(endpoint, deleteId, refetch);
			enqueueSnackbar('Employee deleted successfully', { variant: 'success' });
		} catch (error) {
			enqueueSnackbar('Failed to delete employee', { variant: 'error' });
		} finally {
			closeDeleteDialog();
		}
	};

	// Handle Form Modal
	const openFormModal = (type, employee) => {
		setDialogState({ open: true, type, employee });
	};

	const closeFormModal = () => {
		setDialogState({ open: false, type: '', employee: null });
		refetch();
	};

	const generateWordFile = () => {
		// Construct the document content with OCR-B font style
		const machineCodes = data.map((item) => `<p>${item.empName} |  ${item.qrcode}</p>`).join('\n');

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
		saveAs(blob, 'Employee_LoginCodes.doc');
	};

	// Table Columns
	const columns = [
		{ accessorKey: 'empName', header: 'Employee Name' },
		{ accessorKey: 'designation', header: 'Designation' },
		// { accessorKey: 'empMobile', header: 'Mobile Number' },
		{ accessorKey: 'empEmail', header: 'Email' },
		{ accessorKey: 'qrcode', header: 'Login Code' },
		{
			accessorKey: 'actions',
			header: 'Actions',
			size: 200,
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
				title="Employee Details"
				subtitle="Manage and view employee details here."
				size="medium"
				sx={{ padding: 1 }}
			>
				<Box display="flex">
					<Button
						startIcon={<AddIcon />}
						variant="contained"
						onClick={() => openFormModal('add', null)}
						sx={{ mr: 2 }}
					>
						New Employee
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
					onClick={() => {
						handleMenuClose();
						openFormModal('edit', dialogState.employee);
					}}
				>
					<ModeEditOutlineOutlined color="warning" fontSize="small" sx={{ mr: 1 }} />
					Edit
				</MenuItem>
				<MenuItem
					onClick={() => {
						openDeleteDialog(dialogState.employee?.id);
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
				<DialogContent>Are you sure you want to delete this employee?</DialogContent>
				<DialogActions>
					<Button onClick={closeDeleteDialog}>Cancel</Button>
					<Button onClick={handleDelete} color="error" variant="contained">
						Delete
					</Button>
				</DialogActions>
			</Dialog>

			{/* Employee Form Modal */}
			{dialogState.open && (
				<EmployeeForm employeeDetails={dialogState.employee} onClose={closeFormModal} type={dialogState.type} />
			)}
		</Card>
	);
}

function EmployeeForm({ employeeDetails, onClose, type }) {
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
		reset(
			employeeDetails || { empCode: '', empName: '', designation: '', empMobile: '', empEmail: '', qrcode: '' },
		);
	}, [employeeDetails, reset]);

	const onSubmit = async (data) => {
		try {
			let success = false;
			const updatedData = {
				...data,
				plantcode: user.plantcode,
				compcode: user.compcode,
			};
			if (type === 'edit') {
				// Call updateResource and check the response
				success = await updateResource(
					'EmployeeMasters',
					employeeDetails.id,
					updatedData,
					() => enqueueSnackbar('Employee updated successfully', { variant: 'success' }),
					(error) => enqueueSnackbar(`Failed to update employee: ${error.message}`, { variant: 'error' }),
				);
			} else {
				// Call createResource and check the response
				success = await createResource(
					'EmployeeMasters',
					updatedData,
					() => enqueueSnackbar('Employee created successfully', { variant: 'success' }),
					(error) => enqueueSnackbar(`Failed to create employee: ${error.message}`, { variant: 'error' }),
				);
			}

			// If the operation was successful, close the modal
			if (success) {
				onClose();
			}
		} catch (error) {
			// Handle unexpected errors
			enqueueSnackbar(`An unexpected error occurred: ${error.message}`, { variant: 'error' });
		}
	};

	return (
		<Modal
			openModal
			fnCloseModal={onClose}
			title={type === 'edit' ? 'Edit Employee' : 'New Employee'}
			maxWidth="md"
		>
			<Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2 }}>
				<Grid container spacing={2}>
					{/* Employee Code */}
					<Grid item xs={12} sm={6}>
						<TextField
							label="Employee Code"
							{...register('empCode', { required: 'Employee code is required' })}
							fullWidth
							margin="normal"
							error={!!errors.empCode}
							helperText={errors.empCode?.message}
						/>
					</Grid>

					{/* Employee Name */}
					<Grid item xs={12} sm={6}>
						<TextField
							label="Employee Name"
							{...register('empName', { required: 'Employee name is required' })}
							fullWidth
							margin="normal"
							error={!!errors.empName}
							helperText={errors.empName?.message}
						/>
					</Grid>

					{/* Designation */}
					<Grid item xs={12} sm={6}>
						<DesignationSelect
							register={register}
							setValue={setValue}
							errors={errors}
							designationDetails={employeeDetails}
						/>
					</Grid>

					{/* Mobile Number */}
					<Grid item xs={12} sm={6}>
						<TextField
							label="Mobile Number"
							{...register('empMobile', { required: 'Mobile number is required' })}
							fullWidth
							margin="normal"
							error={!!errors.empMobile}
							helperText={errors.empMobile?.message}
						/>
					</Grid>

					{/* Email */}
					<Grid item xs={12} sm={6}>
						<TextField
							label="Email"
							{...register('empEmail', { required: 'Email is required' })}
							fullWidth
							margin="normal"
							error={!!errors.empEmail}
							helperText={errors.empEmail?.message}
						/>
					</Grid>

					{/* QR Code */}
					<Grid item xs={12} sm={6}>
						<TextField label="QR Code" {...register('qrcode')} fullWidth margin="normal" />
					</Grid>
					{/* personnel_Number */}
					<Grid item xs={12} sm={6}>
						<TextField label="Personnel No" {...register('personnel_Number')} fullWidth margin="normal" />
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

export default EmployeeMaster;
