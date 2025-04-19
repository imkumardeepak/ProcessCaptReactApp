import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/pageHeader';
import {
	Box,
	Breadcrumbs,
	Card,
	Stack,
	Typography,
	TextField,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	CircularProgress,
	Grid,
	Alert,
	InputAdornment,
	IconButton,
	Dialog,
	DialogTitle,
	Divider,
	DialogContent, // Import Alert
} from '@mui/material';
import { styled } from '@mui/system';
import { useSnackbar } from 'notistack'; // Import useSnackbar
import CardHeader1 from '@/components/cardHeader';
import { useApi } from '@/services/machineAPIService';
import useCurrentShift from '@/utils/hooks/useCurrentShift';
import ConfirmButton from '@/components/ConfirmationBox/ConfirmButton';
import { CloseOutlined, InfoOutlined } from '@mui/icons-material';

function Galva() {
	return (
		<>
			<PageHeader title="Galva IN-OUT">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Operations</Typography>
					<Typography color="text.secondary">Galva IN-OUT</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<GalvaCheckForm />
			</Box>
		</>
	);
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
	fontWeight: 'bold',
	color: theme.palette.primary.main,
}));

function GalvaCheckForm() {
	const { fetchData, createResource } = useApi();
	const [routeSheetNo, setRouteSheetNo] = useState('');
	const [details, setDetails] = useState(null);
	const [loading, setLoading] = useState(false);
	const [employeeDetails, setEmployeeDetails] = useState(null);
	const [personQRCode, setPersonQRCode] = useState('');
	const [checkQuantity, setCheckQuantity] = useState(0); // Single check quantity for all
	const [remarks, setRemarks] = useState('NA'); // Default value is NA
	const [showInspectionStack, setShowInspectionStack] = useState(false);
	const [noWorkingDetails, setNoWorkingDetails] = useState(false); // New state
	const [iconLoading, setIconLoading] = useState(false);
	const [iconError, setIconError] = useState(null);
	const [iconData, setIconData] = useState(null);
	const [infoModalOpen, setInfoModalOpen] = useState(false);
	const currentShift = useCurrentShift();
	const { enqueueSnackbar } = useSnackbar(); // Use the hook

	const handleInputChange = (e) => {
		setRouteSheetNo(e.target.value);
	};

	const handlePersonQRCodeChange = (e) => {
		setPersonQRCode(e.target.value);
	};

	const handleCheckQuantityChange = (e) => {
		const value = e.target.value;
		if (!/^\d*$/.test(value)) {
			return;
		}

		const totalQunty =
			details?.details?.find((detail) => detail.isWorking === 0 && detail.isCompleted === 0)?.totalQunty || 0;

		if (Number(value) > totalQunty) {
			return;
		}

		setCheckQuantity(value);
	};

	const handleRemarksChange = (e) => {
		setRemarks(e.target.value); // Update the remarks state
	};

	const fetchDetails = async () => {
		setLoading(true);
		setNoWorkingDetails(false); // Reset before fetching

		try {
			const response = await fetchData(`ProcessingOrders/routesheet/${routeSheetNo}?statusflag=1`);
			if (!response || !response.details) {
				console.log('No details found for the route sheet.');
				setDetails(null);
				setCheckQuantity(0);
				setEmployeeDetails(null);
				setRouteSheetNo('');
				setShowInspectionStack(false); // Ensure inspection stack is hidden
				setNoWorkingDetails(true); // Set no working details to true
				enqueueSnackbar('No details are available for this Route Sheet', { variant: 'info' });
			} else {
				const filteredDetails = response.details.filter(
					(detail) =>
						(['G', 'R'].includes(detail.operation_Code) &&
							detail.isWorking === 0 &&
							detail.isCompleted === 0 &&
							detail.isQC_Done === 0) ||
						(['G', 'R'].includes(detail.operation_Code) &&
							detail.isWorking === 1 &&
							detail.isCompleted === 0 &&
							detail.isQC_Done === 0),
				);
				console.log(filteredDetails);
				setDetails({ ...response, details: filteredDetails });
				setCheckQuantity(filteredDetails[0]?.totalQunty || 0);
				setEmployeeDetails(null);

				// Check for Inspection Codes (I, G, R)
				// const hasInspectionCodes = filteredDetails.some((detail) =>
				// 	['I', 'G', 'R', 'RFD'].includes(detail.operation_Code),
				// );
				// console.log('Has Inspection Codes:', hasInspectionCodes);
				// setShowInspectionStack(hasInspectionCodes);
				// setNoWorkingDetails(filteredDetails.length === 0); // Update the No working details to true
			}
		} catch (e) {
			enqueueSnackbar(`Failed to fetch details: ${e.message}`, { variant: 'error' });
			setDetails(null);
			setCheckQuantity(0); // Also reset checkQuantity in case of error
			setRouteSheetNo('');
			setShowInspectionStack(false); // Ensure inspection stack is hidden
			setNoWorkingDetails(true); // Also set this to true in case of error
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (details === null) {
			setNoWorkingDetails(false);
			return;
		}
		if (details?.details && details.details.length === 0) {
			setNoWorkingDetails(true);
		} else {
			setNoWorkingDetails(false);
		}
	}, [details]);

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			fetchDetails();
		}
	};

	const validPersonQRCode = async (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			setLoading(true);

			try {
				const response = await fetchData(`EmployeeMasters/${personQRCode}`);

				if (!response || response.message === 'Employee not found.') {
					enqueueSnackbar('Employee not found.', { variant: 'error' });
					setPersonQRCode('');
				} else if (response.designation.includes('GALVA')) {
					enqueueSnackbar('Employee Found.', { variant: 'success' });
					setEmployeeDetails(response);
					console.log(response);
				} else {
					enqueueSnackbar('Employee designation must be GALVA.', { variant: 'error' });
					setPersonQRCode('');
				}
			} catch (ex) {
				if (ex.response && ex.response.status === 404) {
					enqueueSnackbar('Employee not found.', { variant: 'error' });
				} else if (ex.response && ex.response.status === 400) {
					enqueueSnackbar('Invalid request. Please check the QR code.', { variant: 'error' });
				} else {
					enqueueSnackbar(`Failed to fetch details: ${ex.message}`, { variant: 'error' });
				}
				setPersonQRCode('');
			} finally {
				setLoading(false);
			}
		}
	};

	const handleSave = async () => {
		setLoading(true);

		if (!details || !employeeDetails || !checkQuantity) {
			enqueueSnackbar('Please scan all the details first...', { variant: 'warning' });
			setLoading(false);
			return;
		}

		try {
			const dataToSend = {
				routeSheetNo: details.routeSheetNo,
				subRouteSheetNo: details.subRouteSheetNo,
				personQRCode: employeeDetails.empName,
				shift: currentShift,
				checkQuantity,
				machineNo: ' ',
				remarks,
				details: details.details, // Use the filtered details here
			};

			await createResource(
				'ProcessingOrders/GalvaINSave',
				dataToSend,
				() => {
					enqueueSnackbar('Galva IN created successfully', { variant: 'success' });
					setRouteSheetNo('');
					setDetails(null);
					setPersonQRCode('');
					setCheckQuantity(0);
					setEmployeeDetails(null);
					setRemarks('NA'); // Reset remarks to default
					setShowInspectionStack(false);
					setNoWorkingDetails(false); // Reset flag on successful save
				},
				(error) => enqueueSnackbar(`Failed to create Galva IN: ${error.message}`, { variant: 'error' }),
			);
		} catch (e) {
			enqueueSnackbar(`Failed to save data: ${e.message}`, { variant: 'error' });
			setRouteSheetNo('');
			setDetails(null);
			setPersonQRCode('');
			setCheckQuantity(0);
			setEmployeeDetails(null);
			setRemarks('NA'); // Reset remarks to default
			setShowInspectionStack(false);
			setNoWorkingDetails(true); // Set flag in case of error
		} finally {
			setLoading(false);
		}
	};

	const handleInspect = async () => {
		setLoading(true);

		if (!details || !checkQuantity) {
			enqueueSnackbar('Please scan all the details first...', { variant: 'warning' });
			setLoading(false);
			return;
		}

		try {
			const dataToSend = {
				routeSheetNo: details.routeSheetNo,
				subRouteSheetNo: details.subRouteSheetNo,
				personQRCode: ' ',
				shift: currentShift,
				checkQuantity,
				machineNo: '',
				remarks: 'NA',
				details: details.details, // Use the filtered details here
			};

			await createResource(
				'ProcessingOrders/saveprocesscheck',
				dataToSend,
				() => {
					enqueueSnackbar('Production Order created successfully', { variant: 'success' });
					setRouteSheetNo('');
					setDetails(null);
					setPersonQRCode('');
					setCheckQuantity(0);
					setEmployeeDetails(null);
					setRemarks('NA'); // Reset remarks to default
					setShowInspectionStack(false);
					setNoWorkingDetails(false); // Reset flag on successful save
				},
				(error) => enqueueSnackbar(`Failed to create Production Order: ${error.message}`, { variant: 'error' }),
			);
		} catch (e) {
			enqueueSnackbar(`Failed to save data: ${e.message}`, { variant: 'error' });
			setRouteSheetNo('');
			setDetails(null);
			setPersonQRCode('');
			setCheckQuantity(0);
			setEmployeeDetails(null);
			setRemarks('NA'); // Reset remarks to default
			setShowInspectionStack(false);
			setNoWorkingDetails(true); // Set flag in case of error
		} finally {
			setLoading(false);
		}
	};
	const handleIconClick = async () => {
		if (!routeSheetNo || !/^\d+$/.test(routeSheetNo)) {
			setIconError('Please enter a valid numeric Route Sheet No.');
			setInfoModalOpen(true);
			return;
		}

		setIconLoading(true);
		setIconError(null);
		setIconData(null);
		setInfoModalOpen(true);

		try {
			const response = await fetchData(`ProductionOrders/${routeSheetNo}`);
			console.log(response);
			setIconData(response);
		} catch (error) {
			setIconError('Failed to fetch details. Please check the Route Sheet No.');
		} finally {
			setIconLoading(false);
		}
	};

	return (
		<Card>
			<Box sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
					<Stack>
						<Typography variant="h5" fontWeight="500" textTransform="uppercase">
							Galva Capture
						</Typography>
						<Typography variant="body1" color="text.secondary">
							Scan the route sheet below to capture for galva.
						</Typography>
					</Stack>
				</Stack>

				<Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mb: 2 }}>
					<TextField
						label="Route Sheet No"
						variant="outlined"
						fullWidth
						value={routeSheetNo}
						onChange={handleInputChange}
						placeholder="Scan or Enter Route Sheet No"
						onKeyDown={handleKeyDown}
						sx={{
							'& .MuiOutlinedInput-root': {
								backgroundColor: '#FFEBEE', // Light red
								'&:hover .MuiOutlinedInput-notchedOutline': {
									borderColor: '#D32F2F',
								},
								'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
									borderColor: '#D32F2F',
								},
							},
							'& .MuiInputLabel-outlined': {
								color: '#D32F2F',
								'&.Mui-focused': {
									color: '#D32F2F',
									fontWeight: 'bold',
								},
							},
							'& .MuiOutlinedInput-input': {
								color: '#B71C1C',
								'&::placeholder': {
									color: '#E57373',
									opacity: 1,
								},
							},
						}}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton onClick={handleIconClick}>
										<InfoOutlined />
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
				</Box>

				{loading && (
					<Box display="flex" justifyContent="center" alignItems="center" my={2}>
						<CircularProgress />
					</Box>
				)}

				{noWorkingDetails && !loading && (
					<Alert variant="filled" severity="warning">
						No operations available for the current process.
					</Alert>
				)}

				{!loading && details && !showInspectionStack && !noWorkingDetails && (
					<>
						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, // 1 column on mobile, 2 columns on larger screens
								gap: 2,
								mb: 2,
							}}
						>
							<TextField
								label="Check Quantity"
								variant="outlined"
								fullWidth
								type="number"
								value={checkQuantity}
								onChange={handleCheckQuantityChange}
								placeholder="Enter Check Quantity"
								InputProps={{
									readOnly: true, // Proper MUI readOnly prop
								}}
								slotProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
								sx={{
									'& .MuiOutlinedInput-root': {
										backgroundColor: '#ECEFF1', // Light slate
										'&:hover .MuiOutlinedInput-notchedOutline': {
											borderColor: '#607D8B',
										},
										'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
											borderColor: '#607D8B',
										},
									},
									'& .MuiInputLabel-outlined': {
										color: '#607D8B',
										'&.Mui-focused': {
											color: '#607D8B',
											fontWeight: 'bold',
										},
									},
									'& .MuiOutlinedInput-input': {
										color: '#455A64',
										'&::placeholder': {
											color: '#90A4AE',
											opacity: 1,
										},
									},
								}}
							/>

							<TextField
								label="Person QR Code"
								variant="outlined"
								fullWidth
								value={personQRCode}
								onChange={handlePersonQRCodeChange}
								placeholder="Scan Person QR Code"
								onKeyDown={validPersonQRCode}
								sx={{
									'& .MuiOutlinedInput-root': {
										backgroundColor: '#FFF8E1', // Light amber
										'&:hover .MuiOutlinedInput-notchedOutline': {
											borderColor: '#FFA000',
										},
										'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
											borderColor: '#FFA000',
										},
									},
									'& .MuiInputLabel-outlined': {
										color: '#FFA000',
										'&.Mui-focused': {
											color: '#FFA000',
											fontWeight: 'bold',
										},
									},
									'& .MuiOutlinedInput-input': {
										color: '#E65100',
										'&::placeholder': {
											color: '#FFB74D',
											opacity: 1,
										},
									},
								}}
							/>
						</Box>

						{/* Remarks Field */}
						<TextField
							label="Remarks"
							variant="outlined"
							fullWidth
							multiline
							rows={2}
							value={remarks}
							onChange={handleRemarksChange}
							placeholder="Enter Remarks"
							sx={{
								mb: 2,
								'& .MuiOutlinedInput-root': {
									backgroundColor: '#E8F5E9', // Light green
									'&:hover .MuiOutlinedInput-notchedOutline': {
										borderColor: '#4CAF50',
									},
									'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
										borderColor: '#4CAF50',
									},
								},
								'& .MuiInputLabel-outlined': {
									color: '#4CAF50',
									'&.Mui-focused': {
										color: '#4CAF50',
										fontWeight: 'bold',
									},
								},
								'& .MuiOutlinedInput-input': {
									color: '#2E7D32',
									'&::placeholder': {
										color: '#A5D6A7',
										opacity: 1,
									},
								},
							}}
						/>

						<TableContainer component={Paper}>
							<Table sx={{ minWidth: 650 }} aria-label="simple table">
								<TableHead>
									<TableRow>
										<StyledTableCell>Operation Number</StyledTableCell>
										<StyledTableCell>Operation Code</StyledTableCell>
										<StyledTableCell>Operation Description</StyledTableCell>
										<StyledTableCell>Total Quantity</StyledTableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{details?.details.map((detail) => (
										<TableRow key={detail.id}>
											<TableCell>{detail.operation_Number}</TableCell>
											<TableCell>{detail.operation_Code}</TableCell>
											<TableCell>{detail.operation_Description}</TableCell>
											<TableCell>{detail.totalQunty}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>

						<Box mt={2} display="flex" justifyContent="flex-end">
							<ConfirmButton
								onConfirm={handleSave}
								isLoading={loading}
								buttonText="Save Details"
								confirmText="Are you sure you want to Save this Galva Check?"
							/>
						</Box>
					</>
				)}

				{showInspectionStack && details && (
					<Stack
						sx={{
							borderRadius: 1,
							border: 2,
							borderColor: 'primary.main',
							borderStyle: 'dotted',
							bgcolor: 'background.paper',
							p: 2,
							mb: 2,
						}}
					>
						<CardHeader1 title={`${details?.details[0]?.operation_Description} Required`} />
						<Typography mb={2}>
							This route sheet has operations that require {details?.details[0]?.operation_Description}.
							Please ensure all steps are completed correctly.
						</Typography>
						<ConfirmButton
							onConfirm={handleInspect}
							isLoading={loading}
							buttonText={`Send for ${details?.details[0]?.operation_Description}`}
							confirmText="Are you sure you want to Send For  Galva Check?"
						/>
					</Stack>
				)}

				<Dialog open={infoModalOpen} onClose={() => setInfoModalOpen(false)} maxWidth="md" fullWidth>
					<DialogTitle sx={{ p: 1 }} variant="h6" bgcolor={'#f5f5f5'}>
						Route Sheet Details
						<IconButton
							aria-label="close"
							onClick={() => setInfoModalOpen(false)}
							sx={{ position: 'absolute', right: 2, top: 2 }}
						>
							<CloseOutlined />
						</IconButton>
					</DialogTitle>
					<Divider />
					<DialogContent>
						{(() => {
							if (iconLoading) {
								return (
									<Box display="flex" justifyContent="center" py={4}>
										<CircularProgress />
									</Box>
								);
							}

							if (iconError) {
								return (
									<Alert severity="error" sx={{ my: 2 }}>
										{iconError}
									</Alert>
								);
							}

							if (iconData) {
								return (
									<Grid container spacing={2} sx={{ mt: 1 }}>
										<Grid item xs={12} sm={6} md={4}>
											<Typography>
												<strong>Work Order:</strong> {iconData.workOrderNo}
											</Typography>
										</Grid>
										<Grid item xs={12} sm={6} md={4}>
											<Typography>
												<strong>Section:</strong> {iconData.sectionCode}
											</Typography>
										</Grid>
										<Grid item xs={12} sm={6} md={4}>
											<Typography>
												<strong>Total Quantity:</strong> {iconData.totalQunty}
											</Typography>
										</Grid>
										<Grid item xs={12} sm={6} md={4}>
											<Typography>
												<strong>Cutting Instruction:</strong> {iconData.cuttingInstruction}
											</Typography>
										</Grid>
										<Grid item xs={12} sm={6} md={4}>
											<Typography>
												<strong>Batch No:</strong> {iconData.batchNo}
											</Typography>
										</Grid>
										<Grid item xs={12} sm={6} md={4}>
											<Typography>
												<strong>Status:</strong>{' '}
												{iconData.statusflag === 0 ? 'In Active' : 'Active'}
											</Typography>
										</Grid>
										<Box mt={1} sx={{ overflowX: 'auto', width: '100%' }}>
											{iconData.details && iconData.details.length > 0 ? (
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
														{iconData.details.map((detail) => (
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
												<Typography variant="body2">
													No production details available.
												</Typography>
											)}
										</Box>
									</Grid>
								);
							}
							return null;
						})()}
					</DialogContent>
				</Dialog>
			</Box>
		</Card>
	);
}

export default Galva;
