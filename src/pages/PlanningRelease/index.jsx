import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	Breadcrumbs,
	Typography,
	Box,
	CircularProgress,
	Card,
	Chip,
	TextField,
	Dialog,
	DialogTitle,
	DialogContent,
	Button,
	Table,
	TableBody,
	TableRow,
	TableCell,
	IconButton,
	Grid,
	TableHead,
	Tooltip,
	Stack,
	Paper,
	Divider,
	Select,
	MenuItem,
	ThemeProvider,
	createTheme,
	useTheme,
} from '@mui/material';
import PageHeader from '@/components/pageHeader';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
	CloseOutlined,
	HourglassBottomRounded,
	PublishedWithChangesOutlined,
	TurnedInNotOutlined,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { enqueueSnackbar } from 'notistack';
import ConfirmButton from '@/components/ConfirmationBox/ConfirmButton';
import { useForm } from 'react-hook-form';
import { isNaN } from 'formik';
import { useApi } from '@/services/machineAPIService';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';

function ProductionRelease() {
	return (
		<>
			<PageHeader title="Production Release">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Operations</Typography>
					<Typography color="text.secondary">Planning Release</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<DataTableSection name="Planning Release" endpoint="ProductionOrders" />
			</Box>
		</>
	);
}

function DataTableSection({ endpoint }) {
	const { fetchData, createResource } = useApi();
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	const refetch = async () => {
		setIsLoading(true);
		try {
			const fetchedData = await fetchData(endpoint);
			const filteredData = fetchedData.filter((item) => item.readflag === 0);
			setData(filteredData);
			setError(null);
		} catch (err) {
			setError(err);
			setData([]);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		refetch();
	}, [endpoint]);

	const [rowSelection, setRowSelection] = useState([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [fullRouteSheets, setFullRouteSheets] = useState([]);
	const [partialRouteSheets, setPartialRouteSheets] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [partialQuantities, setPartialQuantities] = useState({});
	const [availableQuantities, setAvailableQuantities] = useState({});

	const {
		register,
		handleSubmit,
		setValue,
		reset,
		formState: { errors },
	} = useForm();

	const inputRef = useRef(null);

	useEffect(() => {
		if (modalOpen) {
			setTimeout(() => {
				inputRef.current.focus();
			}, 200);
		}
	}, [modalOpen]);

	const handleCloseModal = () => {
		setModalOpen(false);
		setFullRouteSheets([]);
		setPartialRouteSheets([]);
		setRowSelection([]);
		setPartialQuantities({});
		setAvailableQuantities({});
		reset(); //  Reset the form
	};

	const onSubmitForm = (data) => {
		const { routeSheet, quantity } = data;

		if (!routeSheet) {
			enqueueSnackbar('Please enter Route Sheet', { variant: 'error' });
			return;
		}

		if (!fullRouteSheets.map((item) => item.routeSheetNo).includes(routeSheet)) {
			enqueueSnackbar('Route Sheet is not in Full Route Sheets', { variant: 'error' });
			reset();
			return;
		}

		const totalAvailable = availableQuantities[routeSheet];
		if (!quantity || isNaN(quantity) || parseInt(quantity, 10) <= 0) {
			enqueueSnackbar('Please enter Quantity', { variant: 'error' });
			return;
		}

		//  Total Quentity can not greater then  quntity
		if (parseInt(quantity, 10) >= totalAvailable) {
			enqueueSnackbar(`Quantity cannot be greater than Or Equal To ${totalAvailable}`, { variant: 'error' });
			return;
		}

		setPartialRouteSheets((prevPartial) => {
			if (prevPartial.includes(routeSheet)) {
				enqueueSnackbar('This Route Sheet Already On Parital RouteSheet', { variant: 'warning' });
				return prevPartial;
			}
			return [...prevPartial, routeSheet];
		});

		setFullRouteSheets((prevFull) => prevFull.filter((route) => route.routeSheetNo !== routeSheet));
		// Update Avabilable quntity After move
		setAvailableQuantities((prevAvailable) => ({
			...prevAvailable,
			[routeSheet]: totalAvailable - parseInt(quantity, 10),
		}));
		setPartialQuantities((prevQuantities) => ({
			...prevQuantities,
			[routeSheet]: parseInt(quantity, 10), // set the quantity
		}));
		setValue('routeSheet', ''); // Clear the Route Sheet input
		setValue('quantity', ''); // Clear the quantity input
		reset({ routeSheet: '', quantity: '' });
		enqueueSnackbar('Route Sheet added to partial sheets', { variant: 'success' });
	};

	const handleSubmitApi = async () => {
		setIsSubmitting(true);
		setError(null);

		try {
			// Create object for pass on list
			const partialFromFull = [];
			const updatedPartialQuantities = { ...partialQuantities }; // Create a copy to update

			const newFullRouteSheets = fullRouteSheets.filter((item) => {
				if (item.isPartial === 1) {
					partialFromFull.push(item); // Push the entire object, not just the routeSheetNo
					updatedPartialQuantities[item.routeSheetNo] = item.totalQunty; // move full qnty also
					return false;
				}
				return true;
			});

			setPartialRouteSheets((prevPartial) => [
				...prevPartial,
				...partialFromFull.map((item) => item.routeSheetNo),
			]);
			setFullRouteSheets(newFullRouteSheets);
			setPartialQuantities(updatedPartialQuantities);

			const apiData = {
				fullRouteSheets: newFullRouteSheets.map((routeSheet) => ({
					routeSheetNo: routeSheet.routeSheetNo,
					quantity: routeSheet.totalQunty,
				})),
				partialRouteSheets: [...partialRouteSheets, ...partialFromFull.map((item) => item.routeSheetNo)].map(
					(routeSheet) => ({
						routeSheetNo: routeSheet,
						quantity: updatedPartialQuantities[routeSheet] || 0, // Ensure quantity is included
					}),
				),
			};

			console.log(apiData);
			await createResource(
				'ProductionOrders',
				apiData,
				() => enqueueSnackbar('Production Order created successfully', { variant: 'success' }),
				(error) => enqueueSnackbar(`Failed to create Production Order: ${error.message}`, { variant: 'error' }),
			);
			if (partialFromFull.length > 0) {
				enqueueSnackbar(`${partialFromFull.length} Route Sheets automatically moved to partial!`, {
					variant: 'info',
				});
			}
			handleCloseModal();
			refetch();
		} catch (apiError) {
			console.error('Error submitting data:', apiError);
			setError('Failed to submit data. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const selectedRowsData = useMemo(
		() =>
			Object.keys(rowSelection)
				.map((key) => data.find((row) => row.routeSheetNo === key))
				.filter(Boolean),
		[rowSelection, data],
	);

	const handleAddClick = () => {
		// Get total quantity in the following format
		console.log(rowSelection);
		const fullRouteSheetsWithQuantity = selectedRowsData.map((row) => ({
			routeSheetNo: row.routeSheetNo,
			totalQunty: row.pendingQnty,
			isPartial: row.isPartial,
		}));
		setFullRouteSheets(fullRouteSheetsWithQuantity);

		// Set it available quantity
		const availableQuantitiesMap = {};
		selectedRowsData.forEach((row) => {
			availableQuantitiesMap[row.routeSheetNo] = row.pendingQnty;
		});
		setAvailableQuantities(availableQuantitiesMap);

		setPartialRouteSheets([]);
		setPartialQuantities({});
		if (selectedRowsData.length === 0) {
			enqueueSnackbar('Please select at least one Route Sheet', { variant: 'warning' });
			return;
		}
		setModalOpen(true);
	};

	const columns = [
		{
			header: '#',
			Cell: ({ row }) => row.index + 1,
			size: 20,
		},
		{
			accessorKey: 'read_Date',
			header: 'Date',
			size: 50,
			Cell: ({ cell }) => dayjs(cell.getValue()).format('YYYY-MM-DD'),
			Filter: ({ column }) => {
				const [selectedDate, setSelectedDate] = useState(null);

				return (
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DatePicker
							label="Select Date"
							value={selectedDate}
							onChange={(newValue) => {
								setSelectedDate(newValue);
								column.setFilterValue(newValue ? dayjs(newValue).format('YYYY-MM-DD') : null);
							}}
							renderInput={(params) => <TextField {...params} size="small" variant="outlined" />}
						/>
					</LocalizationProvider>
				);
			},
			filterFn: (row, columnId, filterValue) => {
				const rowDate = dayjs(row.getValue(columnId)).format('YYYY-MM-DD');
				return rowDate === filterValue;
			},
		},
		{ accessorKey: 'cuttingInstruction', header: 'Cutting  No', size: 20 },
		{
			accessorKey: 'routeSheetNo',
			header: 'Route Sheet',
			size: 60,
			Cell: ({ cell, row }) => {
				const [open, setOpen] = useState(false);
				const handleOpen = () => setOpen(true);
				const handleClose = () => setOpen(false);

				return (
					<>
						<Button variant="text" color="primary" onClick={handleOpen} sx={{ textTransform: 'none' }}>
							{cell.getValue()}
						</Button>

						<Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
							<DialogTitle sx={{ p: 1 }} variant="h6" bgcolor={'#f5f5f5'}>
								Details for Route Sheet: {cell.getValue()}
								<IconButton
									aria-label="close"
									onClick={handleClose}
									sx={{
										position: 'absolute',
										right: 8,
										top: 8,
										color: (theme) => theme.palette.grey[900],
									}}
								>
									<CloseOutlined />
								</IconButton>
							</DialogTitle>
							<Divider />
							<DialogContent>
								<Grid container spacing={2}>
									<Grid item xs={12}>
										<Typography variant="h6" gutterBottom>
											Production Information
										</Typography>
									</Grid>
									<Grid item xs={6} sm={4} md={3}>
										<Typography variant="subtitle2">
											<strong>Work Order:</strong> {row.original.workOrderNo}
										</Typography>
									</Grid>
									<Grid item xs={6} sm={4} md={3}>
										<Typography variant="subtitle2">
											<strong>Section:</strong> {row.original.sectionCode}
										</Typography>
									</Grid>
									<Grid item xs={6} sm={4} md={3}>
										<Typography variant="subtitle2">
											<strong>Total WT:</strong> {row.original.totalWT} KG
										</Typography>
									</Grid>
									<Grid item xs={6} sm={4} md={3}>
										<Typography variant="subtitle2">
											<strong>Status:</strong>
											{row.original.readflag === 0 ? (
												<Chip label="Open" color="success" size="small" />
											) : (
												<Chip label="Hold" color="warning" size="small" />
											)}
										</Typography>
									</Grid>
									<Grid item xs={6} sm={4} md={3}>
										<Typography variant="subtitle2">
											<strong>Route:</strong> {row.original.routeSheetNo}
										</Typography>
									</Grid>
									<Grid item xs={6} sm={4} md={3}>
										<Typography variant="subtitle2">
											<strong>Mark No:</strong> {row.original.markNo}
										</Typography>
									</Grid>
									<Grid item xs={6} sm={4} md={3}>
										<Typography variant="subtitle2">
											<strong>Length:</strong> {row.original.length}
										</Typography>
									</Grid>
									<Grid item xs={6} sm={4} md={3}>
										<Typography variant="subtitle2">
											<strong>Width:</strong> {row.original.width}
										</Typography>
									</Grid>
									<Grid item xs={6} sm={4} md={3}>
										<Typography variant="subtitle2">
											<strong>Weight Per Kg:</strong> {row.original.weightPerKg}
										</Typography>
									</Grid>
									<Grid item xs={6} sm={4} md={3}>
										<Typography variant="subtitle2">
											<strong>Cutting Instruction:</strong> {row.original.cuttingInstruction}
										</Typography>
									</Grid>
									<Grid item xs={6} sm={4} md={3}>
										<Typography variant="subtitle2">
											<strong>Total Quantity:</strong> {row.original.totalQunty}
										</Typography>
									</Grid>
									<Grid item xs={6} sm={4} md={3}>
										<Typography variant="subtitle2">
											<strong>Batch No:</strong> {row.original.batchNo}
										</Typography>
									</Grid>
									<Grid item xs={6} sm={4} md={3}>
										<Typography variant="subtitle2">
											<strong>Batch Quantity:</strong> {row.original.batchQnty}
										</Typography>
									</Grid>
									<Grid item xs={6} sm={4} md={3}>
										<Typography variant="subtitle2">
											<strong>Embossing Number:</strong> {row.original.embosingNumber}
										</Typography>
									</Grid>
									<Grid item xs={6} sm={4} md={3}>
										<Typography variant="subtitle2">
											<strong>CIP Number:</strong> {row.original.ciP_Number}
										</Typography>
									</Grid>
									<Grid item xs={6} sm={4} md={3}>
										<Typography variant="subtitle2">
											<strong>Description:</strong> {row.original.sectionDesc}
										</Typography>
									</Grid>
								</Grid>

								<Box mt={2}>
									<Typography variant="h6" gutterBottom>
										Production Details
									</Typography>
									{row.original.details && row.original.details.length > 0 ? (
										<Table size="small">
											<TableHead>
												<TableRow>
													<TableCell>Operation Number</TableCell>
													<TableCell>Operation Code</TableCell>
													<TableCell>Operation Description</TableCell>
													<TableCell>Total Qnty</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{row.original.details.map((detail) => (
													<TableRow key={detail.id}>
														<TableCell>{detail.operation_Number}</TableCell>
														<TableCell>{detail.operation_Code}</TableCell>
														<TableCell>{detail.operation_Description}</TableCell>
														<TableCell>{detail.totalQunty}</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									) : (
										<Typography variant="body2">No production details available.</Typography>
									)}
								</Box>
							</DialogContent>
						</Dialog>
					</>
				);
			},
		},
		{ accessorKey: 'workOrderNo', header: 'Work Order No', size: 20 },
		{ accessorKey: 'pendingQnty', header: 'Pending', size: 10 },
		{ accessorKey: 'totalQunty', header: 'Total', size: 10 },
		{
			accessorKey: 'isPartial',
			header: 'isPartial',
			size: 20,
			Cell: ({ row }) => (
				<Tooltip title={row.original.isPartial === 1 ? 'YES' : 'NO'}>
					{row.original.isPartial === 1 ? (
						<Chip label="YES" color="error" size="small" icon={<HourglassBottomRounded />} />
					) : (
						<Chip label="NO" color="success" size="small" icon={<PublishedWithChangesOutlined />} />
					)}
				</Tooltip>
			),
			Filter: ({ column }) => {
				const [selectedPartial, setSelectedPartial] = useState(null);

				const handlePartialChange = (event) => {
					setSelectedPartial(event.target.value);
					column.setFilterValue(event.target.value);
				};

				return (
					<Select value={selectedPartial} onChange={handlePartialChange} size="small" sx={{ width: '100%' }}>
						<MenuItem value={null}>ALL</MenuItem>
						<MenuItem value={1}>YES</MenuItem>
						<MenuItem value={0}>NO</MenuItem>
					</Select>
				);
			},
			filterFn: (row, columnId, filterValue) => {
				if (filterValue === null) {
					return true;
				}
				return row.getValue(columnId) === filterValue;
			},
		},

		// {
		// 	accessorKey: 'readflag',
		// 	header: 'Status',
		// 	size: 100,
		// 	Cell: ({ row }) => (
		// 		<Tooltip title={row.original.readflag === 0 ? 'Open' : 'Hold'}>
		// 			{row.original.readflag === 0 ? (
		// 				<Chip label="Open" color="success" size="small" icon={<InfoOutlined />} />
		// 			) : (
		// 				<Chip label="Hold" color="warning" size="small" icon={<InfoOutlined />} />
		// 			)}
		// 		</Tooltip>
		// 	),
		// },
	];

	const table = useMaterialReactTable({
		columns,
		data: data || [],
		initialState: {
			density: 'compact',
			pagination: { pageSize: 100, pageIndex: 0 },
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection, // This handles both selection and deselection
		state: {
			rowSelection, // Pass the row selection state back to the table
		},
		// Add row ID for proper selection tracking
		getRowId: (originalRow) => originalRow.routeSheetNo,
		enableStickyHeader: true,
		paginationDisplayMode: 'pages',
	});
	const globalTheme = useTheme();

	const tableTheme = useMemo(
		() =>
			createTheme({
				palette: {
					mode: globalTheme.palette.mode, // Use the global theme mode (light/dark)
					primary: globalTheme.palette.primary, // Use primary color from global theme
					info: {
						main: '#006BFF', // Custom color for alerts, if applicable
					},
					background: {
						default: '#fff', // Force white background
						paper: '#fff', // Force white background for paper components
					},
				},
				components: {
					MuiPaper: {
						styleOverrides: {
							root: {
								backgroundColor: '#fff', // Force white for Paper components
							},
						},
					},
					MuiTooltip: {
						styleOverrides: {
							tooltip: {
								fontSize: '1rem', // Override tooltip font size
							},
						},
					},
					MuiTableRow: {
						styleOverrides: {
							root: {
								height: 30, // Adjust row height
								padding: 0, // Remove padding
							},
						},
					},
					MuiTableCell: {
						styleOverrides: {
							root: {
								padding: 4, // Adjust cell padding
							},
						},
					},
					MuiSwitch: {
						styleOverrides: {
							thumb: {
								color: globalTheme.palette.primary.main, // Change switch thumb color
							},
						},
					},
				},
			}),
		[globalTheme],
	);

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
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
				<Stack>
					<Typography variant="h4" fontWeight="500" textTransform="uppercase">
						Planning Release
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Select the work order below to release for production.
					</Typography>
				</Stack>
				<Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
					<Button variant="contained" startIcon={<TurnedInNotOutlined />} onClick={handleAddClick}>
						Allot
					</Button>
				</Box>
			</Box>
			<Box>
				<ThemeProvider theme={tableTheme}>
					<MaterialReactTable
						table={table}
						sx={{
							'& .MuiPaper-root': {
								backgroundColor: '#fff', // Final fallback
								boxShadow: 'none',
							},
						}}
					/>
				</ThemeProvider>
			</Box>

			{/* Modal */}
			<Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
				<DialogTitle sx={{ p: 2 }} variant="h4" bgcolor={'#f5f5f5'}>
					Selected Route Sheets
					<IconButton
						aria-label="close"
						onClick={() => handleCloseModal(false)}
						sx={{ position: 'absolute', right: 8, top: 8 }}
					>
						<CloseOutlined />
					</IconButton>
				</DialogTitle>
				<Divider />
				<DialogContent>
					<form onSubmit={handleSubmit(onSubmitForm)}>
						<Grid container spacing={1} alignItems="center">
							<Grid item xs={12} md={5}>
								<TextField
									label="Enter or Scan Route Sheet"
									variant="outlined"
									fullWidth
									size="small"
									inputRef={inputRef}
									{...register('routeSheet', { required: true })}
									error={!!errors.routeSheet}
									helperText={errors.routeSheet ? 'Route Sheet is required' : ''}
									InputProps={{ inputMode: 'none' }}
								/>
							</Grid>
							<Grid item xs={12} md={3}>
								<TextField
									label="Quantity"
									variant="outlined"
									fullWidth
									size="small"
									type="number"
									{...register('quantity', { required: true, min: 1, pattern: /^[0-9]+$/ })}
									error={!!errors.quantity}
									helperText={(() => {
										if (!errors.quantity) return '';
										if (errors.quantity.type === 'required') return 'Quantity is required';
										if (errors.quantity.type === 'min') return 'Quantity must be greater than 0';
										return 'Quantity must be an integer';
									})()}
								/>
							</Grid>
							<Grid item xs={12} md={4}>
								<Button variant="contained" type="submit" fullWidth>
									Add to Partial
								</Button>
							</Grid>
						</Grid>
					</form>
					<Grid container spacing={1} mt={1}>
						<Grid item xs={12} md={6}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Typography variant="h6">Full Route Sheets</Typography>
								<Typography variant="h6" color="text.secondary">
									Total: {fullRouteSheets.length}
								</Typography>
							</Box>
							<Paper elevation={1} sx={{ p: 0, height: 210, overflowY: 'auto' }}>
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell>Route Sheet</TableCell>
											<TableCell>Quantity</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{fullRouteSheets.map((item) => (
											<TableRow
												key={item.routeSheetNo}
												sx={{
													backgroundColor: item.isPartial === 1 ? '#EAE2C6' : 'inherit', // Highlight partials
												}}
											>
												<TableCell>{item.routeSheetNo}</TableCell>
												<TableCell
													sx={{
														color: item.totalQunty > 60 ? '#D9534F' : 'inherit',
														fontWeight: item.totalQunty > 60 ? 'bold' : 'inherit',
													}}
												>
													{item.totalQunty}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</Paper>
						</Grid>
						<Grid item xs={12} md={6}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Typography variant="h6">Partial Route Sheets</Typography>
								<Typography variant="h6" color="text.secondary">
									Total: {partialRouteSheets.length}
								</Typography>
							</Box>
							<Paper elevation={1} sx={{ p: 0, height: 210, overflowY: 'auto' }}>
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell>Route Sheet</TableCell>
											<TableCell>Quantity</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{partialRouteSheets.map((routeSheet) => (
											<TableRow key={routeSheet}>
												<TableCell>{routeSheet}</TableCell>
												<TableCell>{partialQuantities[routeSheet] || 0}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</Paper>
						</Grid>
					</Grid>

					<Grid container spacing={1} mt={1}>
						<Grid item xs={12}>
							<ConfirmButton
								onConfirm={handleSubmitApi}
								isLoading={isSubmitting}
								buttonText="Confirm Release"
								confirmText="Are you sure you want to release this production order?"
							/>
						</Grid>
					</Grid>
				</DialogContent>
			</Dialog>
		</Card>
	);
}

export default ProductionRelease;
