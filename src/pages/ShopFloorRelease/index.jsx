import React, { useEffect, useState, useCallback } from 'react';
import {
	Breadcrumbs,
	Typography,
	Box,
	CircularProgress,
	Card,
	Chip,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
	Grid,
	Tooltip,
	Stack,
	Divider,
	TableBody,
	TableRow,
	TableCell,
	Table,
	TableHead,
	TextField,
	Alert,
	useTheme,
	useMediaQuery,
	TableContainer,
	Checkbox,
} from '@mui/material';
import PageHeader from '@/components/pageHeader';
import {
	CloseOutlined,
	HourglassBottom,
	LockOpenOutlined,
	PrecisionManufacturing,
	PublishedWithChangesOutlined,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import DataTable from '@/components/dataTable/Example';
import ConfirmButton from '@/components/ConfirmationBox/ConfirmButton';
import { useSnackbar } from 'notistack'; // Import useSnackbar
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/services/machineAPIService';
import useData from '@/utils/hooks/useData';

function ShopFloorRelease() {
	return (
		<>
			<PageHeader title="Shop Floor Release">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Operations</Typography>
					<Typography color="text.secondary">Shop Floor Release</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<DataTableSection name="Shop Floor Release" endpoint="ProcessingOrders/status/0" />
			</Box>
		</>
	);
}

function DataTableSection({ endpoint }) {
	const { fetchData, createResource } = useApi();
	const { data, isLoading, error, refetch } = useData(endpoint, () => fetchData(endpoint));
	const [fetchLoading, setFetchLoading] = useState(false);
	const [modalData, setModalData] = useState(null);
	const [open, setOpen] = useState(false);
	const [releaseModalOpen, setReleaseModalOpen] = useState(false);
	const [machineCode, setMachineCode] = useState('');
	const [routeSheetNo, setRouteSheetNo] = useState('');
	const [scanError, setScanError] = useState('');
	const [machineDetails, setMachineDetails] = useState(null);
	const [routeSheetsResponse, setRouteSheetsResponse] = useState(null);
	const [checkedRouteSheets, setCheckedRouteSheets] = useState([]);
	const [machineCodeError, setMachineCodeError] = useState('');
	const { enqueueSnackbar } = useSnackbar(); // Use the hook
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

	const { user } = useAuth();

	const fetchDetails = async (routeSheetNo) => {
		try {
			const response = await fetchData(`ProductionOrders/${routeSheetNo}`);
			setModalData(response);
			setOpen(true);
		} catch (err) {
			console.error('Error fetching details:', err);
		}
	};

	const handleRelease = async () => {
		if (!machineCode || !routeSheetNo) {
			enqueueSnackbar('Please scan both Machine and Route Sheet!', { variant: 'warning' });
			return;
		}
		try {
			const validRouteSheet = data.find((item) => item.routeSheetNo === routeSheetNo);
			if (!validRouteSheet) {
				enqueueSnackbar('Invalid Route Sheet Number!', { variant: 'error' });
				return;
			}
			if (!user) {
				enqueueSnackbar('User not found!', { variant: 'error' });
				return;
			}
			const checkedRouteSheetNumbers = checkedRouteSheets;
			if (!checkedRouteSheetNumbers.length) {
				enqueueSnackbar('Please check at least one Route Sheet!', { variant: 'error' });
				return;
			}

			const postData = {
				processingOrder: validRouteSheet,
				routeSheetNumbers: checkedRouteSheetNumbers,
				machineDetails,
				user,
			};

			const response = await createResource('ProcessingOrders', postData);

			if (response) {
				enqueueSnackbar('Production Released Successfully!', { variant: 'success' });
				setReleaseModalOpen(false);
				setMachineCode('');
				setRouteSheetNo('');
				setModalData(null);
				setMachineDetails(null);
				refetch();
			} else {
				enqueueSnackbar('Failed to release production.', { variant: 'error' });
			}
		} catch (error) {
			console.error('Error releasing production:', error);
			enqueueSnackbar('Failed to release production. See console for details.', {
				variant: 'error',
			});
		}
	};

	const handleRouteSheetScan = useCallback(async (event) => {
		if (event.key === 'Enter') {
			const scannedRouteSheetNo = event.target.value;
			setRouteSheetNo(scannedRouteSheetNo);

			console.log('scannedRouteSheetNo: ', scannedRouteSheetNo);

			if (!scannedRouteSheetNo) {
				setScanError('Please enter a Route Sheet No.');
				setRouteSheetNo('');
				setModalData(null); // Clear any previous data
				return;
			}

			const response = await fetchData(
				`ProcessingOrders/routesheetbycuttingno/${scannedRouteSheetNo}?statusflag=0`,
			);
			console.log('response : ', response);

			if (!response) {
				setModalData(null);
				setRouteSheetNo('');
				setScanError('Please enter valid  Route Sheet No.');
				enqueueSnackbar('Please enter valid  Route Sheet No', { variant: 'error' });
				return;
			}
			setRouteSheetsResponse(response); // Store the response
			setFetchLoading(true); // Start loading
			try {
				const response = await fetchData(`ProductionOrders/${scannedRouteSheetNo}`);
				console.log('response : ', response);
				setModalData(response);
				setScanError(''); // Clear any previous error
			} catch (err) {
				console.error('Error fetching details:', err);
				setScanError('Error fetching details. Please check the Route Sheet No.');
				setModalData(null); // Clear any previous data
			} finally {
				setFetchLoading(false); // End loading
			}
		}
	}, []);

	const handleMachineCodeScan = useCallback(
		async (event) => {
			if (event.key === 'Enter') {
				const scannedMachineCode = event.target.value;
				setMachineCode(scannedMachineCode);

				if (!scannedMachineCode) {
					setMachineCodeError('Please enter a Machine Code.');
					setMachineDetails(null);
					return;
				}

				setFetchLoading(true);
				try {
					const response = await fetchData(`MachineDetails/${scannedMachineCode}`);
					setMachineDetails(response);
					setMachineCodeError('');

					// Check for operation code match, prioritizing the first operation
					if (modalData && modalData.details) {
						const machineOperationCodes = response.operationCode;
						const firstModalOperationCode = modalData.details[0].operation_Code;

						if (!machineOperationCodes.includes(firstModalOperationCode)) {
							enqueueSnackbar('No matching operation codes found.', { variant: 'error' });
							setMachineCode('');
							setMachineDetails(null);
						}
						enqueueSnackbar('Matching Operation codes found.', { variant: 'success' });
					}
				} catch (err) {
					console.error('Error fetching machine details:', err);
					enqueueSnackbar('Error fetching machine details. Please check the Machine Code.', {
						variant: 'error',
					});
					setMachineDetails(null);
					setMachineCode('');
				} finally {
					setFetchLoading(false);
				}
			}
		},
		[modalData],
	);

	const handleCloseReleaseModal = () => {
		setReleaseModalOpen(false);
		setModalData(null); // Clear modalData when closing the release modal
		setScanError(''); // Clear scan error as well
		setRouteSheetNo('');
		setMachineCode('');
		setOpen(false);
		setRouteSheetsResponse(null);
		setMachineDetails(null); // Clear machine details
		setMachineCodeError('');
	};

	const handleCheck = (routeSheetNo) => {
		const currentIndex = checkedRouteSheets.indexOf(routeSheetNo);
		const newChecked = [...checkedRouteSheets];

		if (currentIndex === -1) {
			newChecked.push(routeSheetNo);
		} else {
			newChecked.splice(currentIndex, 1);
		}

		setCheckedRouteSheets(newChecked);
	};

	const handleSelectAll = () => {
		if (checkedRouteSheets.length === routeSheetsResponse.length) {
			setCheckedRouteSheets([]);
		} else {
			setCheckedRouteSheets(routeSheetsResponse.map((item) => item.routeSheetNo));
		}
	};

	// Reset checked items when response changes
	useEffect(() => {
		if (routeSheetsResponse) {
			setCheckedRouteSheets(routeSheetsResponse.map((item) => item.routeSheetNo));
		}
	}, [routeSheetsResponse]);

	const columns = [
		{
			header: '#',
			Cell: ({ row }) => row.index + 1,
			size: 50,
			enableGrouping: false, // Disable grouping for this column
		},
		{
			accessorKey: 'read_Date',
			header: 'Date',
			size: 100,
			Cell: ({ cell }) => dayjs(cell.getValue()).format('YYYY-MM-DD'),
		},
		{
			accessorKey: 'cuttingInstruction',
			header: 'Cutting Instruction',
			size: 120,
		},
		{
			accessorKey: 'routeSheetNo',
			header: 'Route Sheet',
			size: 150,
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
		{ accessorKey: 'subRouteSheetNo', header: 'Sub RouteSheet No', size: 210 },
		{ accessorKey: 'totalQunty', header: 'Total Qty', size: 150 },
		{
			accessorKey: 'statusflag',
			header: 'Status',
			size: 150,
			Cell: ({ row }) => (
				<Tooltip title={row.original.statusflag === 0 ? 'Open' : 'Hold'}>
					{row.original.statusflag === 0 ? (
						<Chip label="Open" color="info" size="small" icon={<LockOpenOutlined />} />
					) : (
						<Chip label="Hold" color="warning" size="small" icon={<LockOpenOutlined />} />
					)}
				</Tooltip>
			),
		},
		{
			accessorKey: 'isPartial',
			header: 'isPartial',
			size: 150,
			Cell: ({ row }) => (
				<Tooltip title={row.original.isPartial === 1 ? 'YES' : 'NO'}>
					{row.original.isPartial === 1 ? (
						<Chip label="YES" color="error" size="small" icon={<HourglassBottom />} />
					) : (
						<Chip label="NO" color="info" size="small" icon={<PublishedWithChangesOutlined />} />
					)}
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

	const getTableCellStyles = (operationCode, machineDetails) => {
		const baseStyle = {};

		if (machineDetails && machineDetails.operationCode && machineDetails.operationCode.includes(operationCode)) {
			return { ...baseStyle, backgroundColor: 'yellow' }; // Highlight color
		}

		return baseStyle;
	};

	return (
		<>
			<Card>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
					<Stack>
						<Typography variant="h4" fontWeight="500" textTransform="uppercase">
							Shop Floor Release
						</Typography>
						<Typography variant="body1" color="text.secondary">
							Select the work order below to release for production.
						</Typography>
					</Stack>
					<Button
						variant="contained"
						color="primary"
						startIcon={<PrecisionManufacturing />}
						onClick={() => {
							setReleaseModalOpen(true);
						}}
					>
						Release
					</Button>
				</Box>
				<DataTable columns={columns} data={data} />
			</Card>

			{/* Modal for Production Order Details */}
			<Dialog open={open} onClose={handleCloseReleaseModal} maxWidth="lg" fullScreen={fullScreen} fullWidth>
				<DialogTitle variant="h4" bgcolor={'primary.paper'}>
					Production Order Details
					<IconButton
						aria-label="close"
						onClick={() => handleCloseReleaseModal()}
						sx={{ position: 'absolute', right: 8, top: 8 }}
					>
						<CloseOutlined />
					</IconButton>
				</DialogTitle>
				<Divider />
				<DialogContent>
					{modalData ? (
						<Grid container spacing={2}>
							{' '}
							<Grid item xs={6} sm={4} md={3}>
								<Typography>
									<strong>Work Order:</strong> {modalData.workOrderNo}
								</Typography>
							</Grid>
							<Grid item xs={6} sm={4} md={3}>
								<Typography>
									<strong>Section:</strong> {modalData.sectionCode}
								</Typography>
							</Grid>
							<Grid item xs={6} sm={4} md={3}>
								<Typography modalData>
									<strong>Total WT:</strong> {modalData.totalWT} KG
								</Typography>
							</Grid>
							<Grid item xs={6} sm={4} md={3}>
								<Typography modalData>
									<strong>Status:</strong>
									{modalData.readflag === 1 ? (
										<Chip label="Hold" color="warning" size="small" icon={<LockOpenOutlined />} />
									) : (
										<Chip
											label="Open"
											color="success"
											size="small"
											icon={<PublishedWithChangesOutlined />}
										/>
									)}
								</Typography>
							</Grid>
							<Grid item xs={6} sm={4} md={3}>
								<Typography modalData>
									<strong>Route:</strong> {modalData.routeSheetNo}
								</Typography>
							</Grid>
							<Grid item xs={6} sm={4} md={3}>
								<Typography modalData>
									<strong>Mark No:</strong> {modalData.markNo}
								</Typography>
							</Grid>
							<Grid item xs={6} sm={4} md={3}>
								<Typography modalData>
									<strong>Length:</strong> {modalData.length}
								</Typography>
							</Grid>
							<Grid item xs={6} sm={4} md={3}>
								<Typography modalData>
									<strong>Width:</strong> {modalData.width}
								</Typography>
							</Grid>
							<Grid item xs={6} sm={4} md={3}>
								<Typography modalData>
									<strong>Weight Per Kg:</strong> {modalData.weightPerKg}
								</Typography>
							</Grid>
							<Grid item xs={6} sm={4} md={3}>
								<Typography modalData>
									<strong>Cutting Instruction:</strong> {modalData.cuttingInstruction}
								</Typography>
							</Grid>
							<Grid item xs={6} sm={4} md={3}>
								<Typography modalData>
									<strong>Total Quantity:</strong> {modalData.totalQunty}
								</Typography>
							</Grid>
							<Grid item xs={6} sm={4} md={3}>
								<Typography modalData>
									<strong>Batch No:</strong> {modalData.batchNo}
								</Typography>
							</Grid>
							<Grid item xs={6} sm={4} md={3}>
								<Typography modalData>
									<strong>Batch Quantity:</strong> {modalData.batchQnty}
								</Typography>
							</Grid>
							<Grid item xs={6} sm={4} md={3}>
								<Typography modalData>
									<strong>Embossing Number:</strong> {modalData.embosingNumber}
								</Typography>
							</Grid>
							<Grid item xs={6} sm={4} md={3}>
								<Typography modalData>
									<strong>CIP Number:</strong> {modalData.ciP_Number}
								</Typography>
							</Grid>
							<Grid item xs={6} sm={4} md={3}>
								<Typography modalData>
									<strong>Description:</strong> {modalData.sectionDesc}
								</Typography>
							</Grid>
						</Grid>
					) : (
						<Typography variant="body2">No data available.</Typography>
					)}

					{/* Production Details Table */}
					{modalData?.details?.length > 0 ? (
						<Box mt={2}>
							<Typography variant="h4">Production Details</Typography>
							<Table size="small">
								<TableHead>
									<TableRow>
										<TableCell>
											<strong>Operation Number</strong>
										</TableCell>
										<TableCell>
											<strong>Operation Code</strong>
										</TableCell>
										<TableCell>
											<strong>Operation Description</strong>
										</TableCell>
										<TableCell>
											<strong>Total Qty</strong>
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{modalData.details.map((detail, index) => (
										<TableRow key={index}>
											<TableCell>{detail.operation_Number}</TableCell>
											<TableCell>{detail.operation_Code}</TableCell>
											<TableCell>{detail.operation_Description}</TableCell>
											<TableCell>{detail.totalQunty}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Box>
					) : (
						<Typography variant="body2">No production details available.</Typography>
					)}
				</DialogContent>
			</Dialog>

			{/* Release Modal */}
			<Dialog
				open={releaseModalOpen}
				onClose={handleCloseReleaseModal}
				fullScreen={fullScreen}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle variant="h4">
					Enter Shop Floor Release Details
					<IconButton
						aria-label="close"
						onClick={handleCloseReleaseModal}
						sx={{ position: 'absolute', right: 8, top: 8 }}
					>
						<CloseOutlined />
					</IconButton>
				</DialogTitle>
				<Divider />
				<DialogContent>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Scan Route Sheet No"
								variant="outlined"
								value={routeSheetNo}
								onChange={(e) => setRouteSheetNo(e.target.value)}
								onKeyDown={handleRouteSheetScan}
								error={!!scanError}
								helperText={scanError}
							/>
						</Grid>
						{routeSheetsResponse && routeSheetsResponse.length > 0 && (
							<Grid item xs={12}>
								<Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 0 }}>
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											mb: 0,
											px: 1,
											py: 1,
										}}
									>
										<Typography variant="subtitle1" fontWeight="500">
											Available Route Sheets of Cutting No:{' '}
											<strong>{routeSheetsResponse[0]?.cuttingInstruction}</strong>
										</Typography>

										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
											<Chip
												label={`Total: ${routeSheetsResponse.length}`}
												color="primary"
												size="small"
												sx={{ fontWeight: 500 }}
											/>
											<Chip
												label={`Selected: ${checkedRouteSheets.length}`}
												color="secondary"
												size="small"
												sx={{ fontWeight: 500 }}
											/>
										</Box>
									</Box>

									<TableContainer sx={{ maxHeight: 300 }}>
										<Table size="small" stickyHeader>
											<TableHead>
												<TableRow>
													<TableCell padding="checkbox">
														<Checkbox
															color="primary"
															indeterminate={
																checkedRouteSheets.length > 0 &&
																checkedRouteSheets.length < routeSheetsResponse.length
															}
															checked={
																routeSheetsResponse.length > 0 &&
																checkedRouteSheets.length === routeSheetsResponse.length
															}
															onChange={handleSelectAll}
														/>
													</TableCell>
													<TableCell>
														<strong>Route Sheet No</strong>
													</TableCell>
													<TableCell align="right">
														<strong>Total Quantity</strong>
													</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{[...routeSheetsResponse]
													.sort((a, b) => a.routeSheetNo.localeCompare(b.routeSheetNo))
													.map((item) => (
														<TableRow key={item.routeSheetNo}>
															<TableCell padding="checkbox">
																<Checkbox
																	color="primary"
																	checked={checkedRouteSheets.includes(
																		item.routeSheetNo,
																	)}
																	onChange={() => handleCheck(item.routeSheetNo)}
																/>
															</TableCell>
															<TableCell>{item.routeSheetNo}</TableCell>
															<TableCell align="right">{item.totalQunty}</TableCell>
														</TableRow>
													))}
											</TableBody>
										</Table>
									</TableContainer>
								</Box>
							</Grid>
						)}

						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Scan Machine Code"
								variant="outlined"
								value={machineCode}
								onChange={(e) => setMachineCode(e.target.value)}
								onKeyDown={handleMachineCodeScan}
								autoFocus
								error={!!machineCodeError}
								helperText={machineCodeError}
							/>
						</Grid>

						<Grid item xs={12}>
							<ConfirmButton
								onConfirm={handleRelease} // Pass handleRelease function
								isLoading={isLoading} // You can manage loading state here if needed
								buttonText="Confirm Release"
								confirmText="Are you sure you want to release this production order?"
							/>
						</Grid>
					</Grid>
				</DialogContent>
			</Dialog>
		</>
	);
}

export default ShopFloorRelease;
