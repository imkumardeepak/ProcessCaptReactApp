import React, { useEffect, useRef, useState } from 'react';
import {
	Breadcrumbs,
	Typography,
	Box,
	CircularProgress,
	Card,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
	Stack,
	Divider,
	TableBody,
	TableRow,
	TableCell,
	Table,
	TableHead,
	Tooltip,
	Chip,
	TableContainer,
	useTheme,
	useMediaQuery,
	Grid,
	TextField,
	Select,
	MenuItem, // Import TableContainer
} from '@mui/material';
import PageHeader from '@/components/pageHeader';

import { CloseOutlined, Download } from '@mui/icons-material';
import dayjs from 'dayjs';
import DataTable from '@/components/dataTable/Example';
import { useApi } from '@/services/machineAPIService';
import { enqueueSnackbar } from 'notistack';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import generatePDF from 'react-to-pdf';
import InspectionReportTemplate from './InspectionReportTemplate';

function OperationReports() {
	return (
		<>
			<PageHeader title="Operation Reports">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Reports</Typography>
					<Typography color="text.secondary">Operation Reports</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<DataTableSection name="Status Report" endpoint="Report/statusreport" />
			</Box>
		</>
	);
}

function DataTableSection({ endpoint }) {
	const { fetchData } = useApi();
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [modalData, setModalData] = useState(null);
	const [open, setOpen] = useState(false);
	const [showTemplate, setShowTemplate] = useState(false);

	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

	const fetchDetails = async (routeSheetNo) => {
		try {
			const response = await fetchData(`ProcessingOrders/routesheet/${routeSheetNo}?statusflag=1`);
			setModalData(response);
			setOpen(true);
		} catch (err) {
			enqueueSnackbar('Error fetching details:', { variant: 'error' });
			setOpen(false);
		}
	};
	const templateRef = useRef();
	const handleGeneratePDF = () => {
		setShowTemplate(true);
		setTimeout(() => {
			generatePDF(templateRef, {
				filename: `inspection-report-${modalData?.routeSheetNo || 'unknown'}.pdf`,
				page: {
					margin: 1,
					format: 'a4',
					orientation: 'landscape',
				},
			}).then(() => {
				setShowTemplate(false);
			});
		}, 100);
	};

	const refetch = async () => {
		setIsLoading(true);
		try {
			const fetchedData = await fetchData(endpoint);
			setData(fetchedData);
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

	const handleCloseModal = () => {
		setOpen(false);
		setModalData(null);
	};

	const columns = [
		{ accessorKey: 'plantCode', header: 'Project', size: 80 },
		{
			accessorKey: 'workOrder',
			header: 'Work Order',
			size: 110,
			enableSorting: true,
		},
		{
			accessorKey: 'cuttingNo',
			header: 'Cutting No',
			size: 100,
			// Cell: ({ cell }) => (
			// 	<Button
			// 		variant="text"
			// 		color="primary"
			// 		onClick={() => fetchCuttingDetails(cell.getValue())}
			// 		sx={{ textTransform: 'none' }}
			// 	>
			// 		{cell.getValue()}
			// 	</Button>
			// ),
		},
		{
			accessorKey: 'routeSheetNo',
			header: 'Sheet No',
			size: 120,
			Cell: ({ cell }) => (
				<Button
					variant="text"
					color="primary"
					onClick={() => fetchDetails(cell.getValue())}
					sx={{ textTransform: 'none' }}
				>
					{cell.getValue()}
				</Button>
			),
		},
		{
			accessorKey: 'subRouteSheetNo',
			header: 'Sub-Sheet No',
			size: 120,
		},
		{ accessorKey: 'markNo', header: 'Mark No', size: 120 },
		{ accessorKey: 'setcion', header: 'Section Desc', size: 160 },
		{ accessorKey: 'totalQunty', header: 'TQ', size: 80, enableColumnFilter: false, enableSorting: false },
		{ accessorKey: 'pendingQunty', header: 'BQ', size: 80, enableColumnFilter: false, enableSorting: false },
		{
			accessorKey: 'isPartial',
			header: 'Partial',
			size: 100,
			Cell: ({ row }) => (
				<Tooltip title={row.original.isPartial === 1 ? 'YES' : 'NO'}>
					{row.original.isPartial === 1 ? (
						<Chip label="YES" color="error" size="small" />
					) : (
						<Chip label="NO" color="primary" size="small" />
					)}
				</Tooltip>
			),
		},
		{
			accessorKey: 'isCompleted',
			header: 'Status',
			size: 100,
			Cell: ({ row }) => (
				<Tooltip
					title={
						row.original.isCompleted === 0
							? 'IN-PROCESS'
							: row.original.isCompleted === 1
								? 'COMPLETED'
								: 'ON-HOLD'
					}
				>
					{row.original.isCompleted === 0 ? (
						<Chip label="IN-PROCESS" color="warning" size="small" />
					) : row.original.isCompleted === 1 ? (
						<Chip label="COMPLETED" color="success" size="small" />
					) : (
						<Chip label="ON-HOLD" color="error" size="small" />
					)}
				</Tooltip>
			),
		},
		{
			accessorKey: 'statusCode',
			header: 'Completed',
			size: 150,
			Cell: ({ row }) => <Chip label={row.original.statusCode.toUpperCase()} color="success" size="small" />,
		},
		{
			accessorKey: 'nextCode',
			header: 'Next ',
			size: 150,
			Cell: ({ row }) => <Chip label={row.original.nextCode.toUpperCase()} color="error" size="small" />,
		},
		{ accessorKey: 'totalWt', header: 'Total Wt', size: 80 },
		{ accessorKey: 'length', header: 'Length', size: 100 },
		{ accessorKey: 'width', header: 'Width', size: 100 },
		{ accessorKey: 'batch', header: 'Batch', size: 110 },
		{ accessorKey: 'cip', header: 'CIP', size: 110 },
		{ accessorKey: 'embosing', header: 'Embosing', size: 110 },
		{
			accessorKey: 'process_Date',
			header: 'Date',
			size: 100,
			Cell: ({ cell }) => dayjs(cell.getValue()).format('DD-MM-YYYY'),
		},
	];

	// Render Loading/Error States
	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" height="200px">
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" height="200px">
				<Typography variant="h6" color="error">
					Failed to load data.
				</Typography>
			</Box>
		);
	}

	return (
		<>
			<Card>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
					<Stack>
						<Typography variant="h4" fontWeight="500" textTransform="uppercase">
							Operation Reports
						</Typography>
						<Typography variant="body1" color="text.secondary">
							See the work order below to release for production.
						</Typography>
					</Stack>
				</Box>
				<Box>
					<DataTable columns={columns} data={data} />
				</Box>
			</Card>

			{/* Modal for Production Order Details */}
			<Dialog open={open} onClose={handleCloseModal} maxWidth="lg" fullScreen={fullScreen} fullWidth>
				<DialogTitle variant="h4" bgcolor={'primary.paper'}>
					INPROCESS INSPECTION REPORT OF {modalData ? modalData?.routeSheetNo : ''}
					<IconButton
						aria-label="close"
						onClick={handleCloseModal}
						sx={{ position: 'absolute', right: 8, top: 8 }} // Adjusted right position
					>
						<CloseOutlined />
					</IconButton>
					<IconButton
						aria-label="download"
						onClick={handleGeneratePDF}
						sx={{ position: 'absolute', right: 40, top: 10 }}
					>
						<Download />
					</IconButton>
				</DialogTitle>
				<Divider />
				<DialogContent sx={{ p: 0 }}>
					{modalData ? (
						<Grid container spacing={2}>
							{modalData.details && modalData.details.length > 0 ? (
								<Grid item xs={12} sm={12} md={12} mt={0}>
									<Box display="flex" justifyContent="center" sx={{ width: '100%' }}>
										<TableContainer sx={{ maxWidth: '100%', maxHeight: 'calc(100vh - 150px)' }}>
											<Table stickyHeader size="small">
												<TableHead>
													<TableRow>
														<TableCell justifyContent="center" align="center">
															<strong>Line No</strong>
														</TableCell>
														<TableCell justifyContent="center" align="center">
															<strong>Job Description</strong>
														</TableCell>
														<TableCell justifyContent="center" align="center">
															<strong>Machine Number</strong>
														</TableCell>

														<TableCell justifyContent="center" align="center">
															<strong>Date</strong>
														</TableCell>
														<TableCell justifyContent="center" align="center">
															<strong>Shift</strong>
														</TableCell>
														<TableCell justifyContent="center" align="center">
															<strong>Total Qnty</strong>
														</TableCell>
														<TableCell justifyContent="center" align="center">
															<strong>Qnty At Check</strong>
														</TableCell>
														<TableCell justifyContent="center" align="center">
															<strong>Checked By</strong>
														</TableCell>
													</TableRow>
												</TableHead>
												<TableBody>
													{modalData.details
														.filter((detail) => detail.isCompleted === 1)
														.sort(
															(a, b) =>
																new Date(a.checkDateTime) - new Date(b.checkDateTime),
														)
														.map((detail, index) => (
															<TableRow key={index}>
																<TableCell justifyContent="center" align="center">
																	{detail.operation_Number}
																</TableCell>
																<TableCell justifyContent="center" align="center">
																	{detail.operation_Description}
																</TableCell>
																<TableCell justifyContent="center" align="center">
																	{detail.machineNo}
																</TableCell>
																<TableCell>
																	<Box
																		display="flex"
																		flexDirection="column"
																		alignItems="center"
																	>
																		<Typography
																			variant="body1"
																			sx={{ fontSize: '0.9rem' }}
																		>
																			{dayjs(detail.checkDateTime).format(
																				'DD-MM-YYYY',
																			)}
																		</Typography>
																		<Typography
																			variant="body2"
																			sx={{ fontSize: '0.8rem' }}
																		>
																			{dayjs(detail.checkDateTime).format(
																				'HH:mm:ss',
																			)}
																		</Typography>
																	</Box>
																</TableCell>

																<TableCell justifyContent="center" align="center">
																	{detail.shift}
																</TableCell>
																<TableCell justifyContent="center" align="center">
																	{modalData.totalQunty}
																</TableCell>
																<TableCell justifyContent="center" align="center">
																	{detail.checkQnty}
																</TableCell>
																<TableCell justifyContent="center" align="center">
																	{detail.operator}
																</TableCell>
															</TableRow>
														))}
												</TableBody>
											</Table>
										</TableContainer>
									</Box>
								</Grid>
							) : (
								<Typography variant="body2">No production details available.</Typography>
							)}
						</Grid>
					) : (
						<Typography variant="body2">No data available.</Typography>
					)}
				</DialogContent>
			</Dialog>

			<Box
				ref={templateRef}
				sx={{
					position: 'absolute',
					left: '-9999px',
					width: '300mm',
					backgroundColor: 'white',
					visibility: showTemplate ? 'visible' : 'hidden',
				}}
			>
				<InspectionReportTemplate data={modalData} />
			</Box>
		</>
	);
}

export default OperationReports;
