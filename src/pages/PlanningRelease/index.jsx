import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from 'lodash';
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
	DialogActions,
	TableContainer,
} from '@mui/material';
import PageHeader from '@/components/pageHeader';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
	AddOutlined,
	CloseOutlined,
	DoneAllOutlined,
	HourglassBottomRounded,
	NewReleasesOutlined,
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
import { ImFileExcel, ImFilePdf } from 'react-icons/im';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import useData from '@/utils/hooks/useData';

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
	const theme = useTheme();
	const [rowSelection, setRowSelection] = useState([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [fullRouteSheets, setFullRouteSheets] = useState([]);
	const [partialRouteSheets, setPartialRouteSheets] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [partialQuantities, setPartialQuantities] = useState({});
	const [availableQuantities, setAvailableQuantities] = useState({});
	const [AgainReleaseModal, SetAgainReleaseModal] = useState(false);
	const [routeSheetNo, setRouteSheetNo] = useState('');
	const [routeSheetDetails, setRouteSheetDetails] = useState(null);
	const [loading, setLoading] = useState(false);
	const [routesheetsList, setRoutesheetsList] = useState([]);
	const [currentQuantity, setCurrentQuantity] = useState(0);
	const [EnterQuantity, setEnterQuantity] = useState(0);
	const routeSheetRef = useRef(null);
	const fetchCallback = useCallback(
		debounce(() => fetchData(endpoint), 300),
		[fetchData, endpoint],
	);
	const { data, isLoading, error, refetch } = useData(endpoint, fetchCallback);

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
			enqueueSnackbar('Failed to submit data. Please try again.', { variant: 'error' });
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

	const handleExportExcelWithTheme = (rows) => {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Sheet 1');

		const headers = Object.keys(rows[0].original).map((header) => header.toUpperCase());
		const headerRow = worksheet.addRow(headers);

		headerRow.eachCell((cell) => {
			cell.font = {
				name: 'Calibri',
				bold: true,
				size: 12,
			};
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'AAB99A' },
			};
			cell.alignment = {
				vertical: 'middle',
				horizontal: 'center',
			};
			cell.border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			};
		});

		rows.forEach((row) => {
			const dataRow = worksheet.addRow(Object.values(row.original));
			console.log(dataRow);
			dataRow.eachCell((cell) => {
				cell.font = {
					name: 'Calibri',
					size: 11,
				};
				cell.alignment = {
					vertical: 'middle',
					horizontal: 'left',
				};
				cell.border = {
					top: { style: 'thin' },
					left: { style: 'thin' },
					bottom: { style: 'thin' },
					right: { style: 'thin' },
				};
			});
		});

		worksheet.columns.forEach((column) => {
			let maxLength = 0;
			column.eachCell({ includeEmpty: true }, (cell) => {
				const cellValue = cell.value || '';
				maxLength = Math.max(maxLength, cellValue.toString().length);
			});
			column.width = maxLength + 2;
		});

		workbook.xlsx.writeBuffer().then((buffer) => {
			const blob = new Blob([buffer], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			});
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = 'export.xlsx';
			link.click();
		});
	};

	const handleExportPdf = (rows) => {
		const doc = new jsPDF({
			orientation: 'landscape',
			format: 'a3',
		});

		const title = 'Production Release Data Export';
		doc.setFont('Helvetica', 'bold');
		doc.setFontSize(18);
		doc.text(title, 14, 20);

		const headers = Object.keys(rows[0].original).map((header) => header.toUpperCase());
		const tableData = rows.map((row) => Object.values(row.original));

		autoTable(doc, {
			head: [headers],
			body: tableData,
			startY: 30,
			styles: {
				font: 'Helvetica',
				fontSize: 10,
				halign: 'center',
				valign: 'middle',
			},
			headStyles: {
				fillColor: [63, 81, 181],
				textColor: [255, 255, 255],
				fontSize: 12,
				halign: 'center',
				bold: true,
			},
			alternateRowStyles: {
				fillColor: [245, 245, 245],
			},
			bodyStyles: {
				textColor: [0, 0, 0],
			},
			columnStyles: {
				0: { halign: 'left' },
			},
			margin: { top: 30, bottom: 20, left: 14, right: 14 },
		});

		const pageCount = doc.getNumberOfPages();
		for (let i = 1; i <= pageCount; i++) {
			doc.setPage(i);
			doc.setFont('Helvetica', 'normal');
			doc.setFontSize(10);
			const footerText = `Page ${i} of ${pageCount}`;
			doc.text(footerText, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, {
				align: 'right',
			});
		}

		doc.save('export.pdf');
	};

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

	const handleReleaseAgainClick = () => {
		SetAgainReleaseModal(true);
		setTimeout(() => {
			if (routeSheetRef.current) {
				routeSheetRef.current.focus();
			}
		}, 100);
	};

	const handleReleaseAgainClose = () => {
		SetAgainReleaseModal(false);
		setRouteSheetNo('');
		setCurrentQuantity(0);
		setRoutesheetsList([]);
		setRouteSheetDetails(null);
		setEnterQuantity(0);
	};

	const handleInputChange = (e) => {
		setRouteSheetNo(e.target.value);
	};
	const fetchDetails = async () => {
		setLoading(true);
		try {
			const response = await fetchData(`ProcessingOrders/routesheet/${routeSheetNo}?statusflag=0`);
			console.log(response);
			if (!response || !response.details) {
				console.log('No details found for the route sheet.');
				setRouteSheetDetails(null);
				enqueueSnackbar('No details are available for this Route Sheet', { variant: 'info' });
				setTimeout(() => {
					if (routeSheetRef.current) {
						routeSheetRef.current.focus();
					}
				}, 100);
			} else if (response.totalQunty > 1) {
				setRouteSheetDetails(null);
				setEnterQuantity(0);
				setRoutesheetsList([]);
				setCurrentQuantity(0);
				setRouteSheetDetails(response);
				enqueueSnackbar('Route Sheet Details Found successfully', { variant: 'success' });
				setCurrentQuantity(response.totalQunty);
			} else {
				enqueueSnackbar('Quantity is Always greater than 1', { variant: 'info' });
				setRouteSheetDetails(null);
				setRouteSheetNo('');
				setTimeout(() => {
					if (routeSheetRef.current) {
						routeSheetRef.current.focus();
					}
				}, 100);
			}
		} catch (e) {
			enqueueSnackbar(`Failed to fetch details: ${e.message}`, { variant: 'error' });
		} finally {
			setLoading(false);
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			fetchDetails();
		}
	};

	const handlePartialAddClick = () => {
		if (!routeSheetDetails || !routeSheetNo || EnterQuantity <= 0) {
			enqueueSnackbar('Please enter a valid route sheet', { variant: 'error' });
			return;
		}
		if (routesheetsList.length > 0) {
			if (routesheetsList[0].routesheetNo !== routeSheetNo) {
				enqueueSnackbar('Dont scan another route sheet', { variant: 'error' });
				return;
			}
		}

		const quantityToAdd = EnterQuantity;

		if (currentQuantity < quantityToAdd) {
			enqueueSnackbar('Quantity is greater than available quantity', { variant: 'error' });
			return;
		}
		// Add new entry to the list
		setRoutesheetsList((prev) => [
			...prev,
			{
				routesheetNo: routeSheetNo,
				quantity: quantityToAdd,
				timestamp: new Date().toISOString(),
			},
		]);

		// Update current quantity
		const newQuantity = currentQuantity - EnterQuantity;
		setCurrentQuantity(newQuantity);

		// Check if completed
		if (newQuantity === 0) {
			enqueueSnackbar('All quantities added successfully!', { variant: 'success' });
		}
	};

	const handlePartialSubmitApi = async () => {
		if (routesheetsList.length === 0) {
			enqueueSnackbar('Please Complete The Total Quantity of route sheet', { variant: 'error' });
			return;
		}
		if (currentQuantity !== 0) {
			enqueueSnackbar('Quantity is not fulfilled', { variant: 'error' });
			return;
		}
		setLoading(true);
		try {
			await createResource(
				'ProductionOrders/SaveSlpitPartial',
				routesheetsList,
				() => {
					enqueueSnackbar('Production Order created successfully', { variant: 'success' });
					setRouteSheetNo('');
					setEnterQuantity(0);
					setRoutesheetsList([]);
					setCurrentQuantity(0);
					setRouteSheetDetails(null);
					SetAgainReleaseModal(false);
				},
				(error) => enqueueSnackbar(`Failed to create Production Order: ${error.message}`, { variant: 'error' }),
			);
		} catch (e) {
			enqueueSnackbar(`Failed to save data: ${e.message}`, { variant: 'error' });
			setRouteSheetNo('');
			setEnterQuantity(0);
			setRoutesheetsList([]);
			setCurrentQuantity(0);
		} finally {
			setLoading(false);
		}
	};

	const columns = useMemo(
		() => [
			{
				accessorKey: 'read_Date',
				header: 'Date',
				size: 100,
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
			{ accessorKey: 'plantcode', header: 'Project Code', size: 100 },
			{
				accessorKey: 'cuttingInstruction',
				header: 'Cutting  No',
				size: 100,
				enableSorting: true,
				enableGrouping: true,
			},
			{
				accessorKey: 'routeSheetNo',
				header: 'Route Sheet',
				size: 120,
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
			{ accessorKey: 'markNo', header: 'Mark No', size: 180 },
			{ accessorKey: 'workOrderNo', header: 'Work Order No', size: 150 },
			{ accessorKey: 'pendingQnty', header: 'Pending', size: 120 },
			{ accessorKey: 'totalQunty', header: 'Total', size: 120 },
			{
				accessorKey: 'isPartial',
				header: 'isPartial',
				size: 120,
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
						<Select
							value={selectedPartial}
							onChange={handlePartialChange}
							size="small"
							sx={{ width: '100%' }}
						>
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
		],
		[],
	);

	const table = useMaterialReactTable({
		columns,
		data: data || [],
		enableRowVirtualization: true,
		enableColumnVirtualization: true,
		initialState: {
			density: 'compact',
			pagination: { pageSize: 100, pageIndex: 0 },
		},
		enableRowSelection: true,
		enableColumnResizing: true,
		enableRowNumbers: true,
		onRowSelectionChange: setRowSelection, // This handles both selection and deselection
		state: {
			rowSelection, // Pass the row selection state back to the table
		},
		// Add row ID for proper selection tracking
		getRowId: (originalRow) => originalRow.routeSheetNo,
		enableStickyHeader: true,
		paginationDisplayMode: 'pages',
		renderTopToolbarCustomActions: ({ table }) => (
			<Box sx={{ display: 'flex', gap: '1rem', p: '8px', alignItems: 'center' }}>
				<Button
					color="success"
					onClick={() => handleExportExcelWithTheme(table.getPrePaginationRowModel().rows)}
					startIcon={<ImFileExcel />}
					variant="text"
				>
					Export to Excel
				</Button>
				<Button
					color="error"
					onClick={() => handleExportPdf(table.getPrePaginationRowModel().rows)}
					startIcon={<ImFilePdf />}
					variant="text"
				>
					Export to PDF
				</Button>
			</Box>
		),
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
								height: 45, // Adjust row height
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
						Planning Release
					</Button>
					<Button variant="contained" startIcon={<NewReleasesOutlined />} onClick={handleReleaseAgainClick}>
						Split Release
					</Button>
				</Box>
			</Box>
			<Box>
				<Box sx={{ maxHeight: '800px', overflow: 'auto' }}>
					<ThemeProvider theme={tableTheme}>
						<MaterialReactTable table={table} />
					</ThemeProvider>
				</Box>
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

			{/* Again Release Modal */}
			<Dialog open={AgainReleaseModal} onClose={() => handleReleaseAgainClose(false)} maxWidth="md" fullWidth>
				<DialogTitle sx={{ p: 2 }} variant="h4" bgcolor={'#f5f5f5'}>
					Split Route Sheets After Release
					<IconButton
						aria-label="close"
						onClick={() => handleReleaseAgainClose(false)}
						sx={{ position: 'absolute', right: 8, top: 8 }}
					>
						<CloseOutlined />
					</IconButton>
				</DialogTitle>
				<Divider />
				<DialogContent sx={{ p: 1 }}>
					<Box
						sx={{
							p: 2,
							borderLeft: `4px solid ${theme.palette.warning.main}`,
							borderBottom: `1px solid ${theme.palette.divider}`,
							mb: 2,
							borderRadius: '0 4px 4px 0',
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
							<Box
								sx={{
									mr: 1.5,
									mt: 0.5,
									color: theme.palette.warning.dark,
									fontSize: '1.2rem',
								}}
							>
								⚠️
							</Box>
							<Box>
								<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
									Important Release Considerations(Before Shop Floor Release):
								</Typography>
								<Box
									component="ul"
									sx={{
										pl: 2.5,
										m: 0,
										'& li': {
											mb: 0.5,
											typography: 'body2',
											color: theme.palette.text.secondary,
										},
									}}
								>
									<li>Split complete releases route sheet into multiple planning orders as needed</li>
									<li>
										Distribute single route sheet to mutiple different production machine before
										shop floor release
									</li>
								</Box>
							</Box>
						</Box>
					</Box>
					<Box>
						{loading ? (
							<Box display="flex" justifyContent="center" alignItems="center" height="100%">
								<CircularProgress />
							</Box>
						) : (
							<>
								<Grid container spacing={2} alignItems="right" justifyContent="right" mb={2}>
									<Grid item xs={12} md={1} sm={1}>
										<Chip label={currentQuantity} variant="filled" color="primary" />
									</Grid>
								</Grid>
								<Grid container spacing={2} alignItems="center">
									<Grid item xs={12} md={7} sm={7}>
										<TextField
											label="Enter or Scan Route Sheet"
											variant="outlined"
											fullWidth
											size="small"
											inputRef={routeSheetRef}
											autoComplete="off"
											autoCorrect="off"
											spellCheck={false}
											value={routeSheetNo}
											onChange={handleInputChange}
											placeholder="Scan or Enter Route Sheet No"
											onKeyDown={handleKeyDown}
										/>
									</Grid>
									<Grid item xs={12} md={3} sm={3}>
										<TextField
											id="outlined-read-only-input"
											label="Quantity"
											fullWidth
											size="small"
											value={EnterQuantity}
											type="number"
											onChange={(e) => setEnterQuantity(e.target.value)}
										/>
									</Grid>
									<Grid item xs={12} md={2} sm={2}>
										<Button
											variant="contained"
											fullWidth
											endIcon={<AddOutlined />}
											onClick={handlePartialAddClick}
										>
											Add
										</Button>
									</Grid>
								</Grid>
								{routesheetsList.length > 0 && (
									<Box mt={4}>
										<Typography variant="h6" gutterBottom>
											Added Routesheets
										</Typography>
										<TableContainer component={Paper} variant="outlined">
											<Table size="small">
												<TableHead>
													<TableRow>
														<TableCell>
															<b>#</b>
														</TableCell>
														<TableCell>
															<b>Route Sheet</b>
														</TableCell>
														<TableCell>
															<b>Quantity</b>
														</TableCell>
														<TableCell>
															<b>Timestamp</b>
														</TableCell>
													</TableRow>
												</TableHead>
												<TableBody>
													{routesheetsList.map((item, index) => (
														<TableRow key={index} hover>
															<TableCell>{index + 1}</TableCell>
															<TableCell>{item.routesheetNo}</TableCell>
															<TableCell>{item.quantity}</TableCell>
															<TableCell>
																{new Date(item.timestamp).toLocaleString()}
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</TableContainer>
									</Box>
								)}
							</>
						)}
					</Box>
				</DialogContent>
				<Divider />
				<DialogActions>
					<Grid item xs={12} md={4}>
						<Button
							variant="outlined"
							color="error"
							fullWidth
							startIcon={<CloseOutlined />}
							onClick={handleReleaseAgainClose}
						>
							Close
						</Button>
					</Grid>
					<Grid item xs={12} md={4}>
						<Button
							variant="contained"
							fullWidth
							endIcon={<DoneAllOutlined />}
							onClick={handlePartialSubmitApi}
						>
							Add to Partial
						</Button>
					</Grid>
				</DialogActions>
			</Dialog>
		</Card>
	);
}

export default ProductionRelease;
