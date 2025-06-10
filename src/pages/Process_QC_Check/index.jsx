import React, { useState, useEffect, useRef } from 'react';
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
	Grid, // Import Grid
	Alert,
	styled, // Import Alert
	InputAdornment,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	Divider,
} from '@mui/material';
import { useSnackbar } from 'notistack'; // Import useSnackbar
import CardHeader1 from '@/components/cardHeader';
import { useApi } from '@/services/machineAPIService';
import useCurrentShift from '@/utils/hooks/useCurrentShift';
import ConfirmButton from '@/components/ConfirmationBox/ConfirmButton';
import { CloseOutlined, InfoOutlined, CheckCircleOutline } from '@mui/icons-material';

function ProcessQCCheck() {
	return (
		<>
			<PageHeader title="Process Capture">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Operations</Typography>
					<Typography color="text.secondary">Process Capture</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<QCCheckForm />
			</Box>
		</>
	);
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
	fontWeight: 'bold',
	color: theme.palette.primary.main,
}));

function QCCheckForm() {
	const { fetchData, createResource } = useApi();
	const [routeSheetNo, setRouteSheetNo] = useState('');
	const [details, setDetails] = useState(null);
	const [loading, setLoading] = useState(false);
	const [machineDetails, setMachineDetails] = useState(null);
	const [nextmachineDetails, setnextMachineDetails] = useState(null);
	const [employeeDetails, setEmployeeDetails] = useState(null);
	const [personQRCode, setPersonQRCode] = useState('');
	const [machineQRCode, setMachineQRCode] = useState('');
	const [nextMachineQRCode, setNextMachineQRCode] = useState('');
	const [productionDetails, setProductionDetails] = useState(null);
	const [AllProductionDetails, setAllProductionDetails] = useState(null);
	const [checkQuantity, setCheckQuantity] = useState(0);
	const [remarks, setRemarks] = useState('NA');
	const [showInspectionStack, setShowInspectionStack] = useState(false);
	const [noWorkingDetails, setNoWorkingDetails] = useState(false);
	const [iconLoading, setIconLoading] = useState(false);
	const [iconError, setIconError] = useState(null);
	const [iconData, setIconData] = useState(null);
	const [infoModalOpen, setInfoModalOpen] = useState(false);
	const currentShift = useCurrentShift();

	const { enqueueSnackbar } = useSnackbar(); // Use the hook

	const routeSheetRef = useRef(null);
	const machineQRRef = useRef(null);
	const personQRRef = useRef(null);
	const nextMachineQRRef = useRef(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (routeSheetRef.current) {
				routeSheetRef.current.focus();
			}
		}, 50); // Reduced delay for better UX
		return () => clearTimeout(timer); // Cleanup timer
	}, []);

	const handleInputChange = (e) => {
		setRouteSheetNo(e.target.value);
	};

	const handlePersonQRCodeChange = (e) => {
		setPersonQRCode(e.target.value);
	};

	const handleCheckQuantityChange = (e) => {
		const { value } = e.target;

		if (!/^\d*$/.test(value)) {
			return;
		}

		const totalQunty =
			details?.details?.find((detail) => detail.isWorking === 0 && detail.isCompleted === 0)?.totalQunty || 1;

		let parsedValue = Number(value);

		if (value === '') {
			parsedValue = 1;
		}

		const clampedValue = Math.min(Math.max(parsedValue || 1, 1), totalQunty);

		setCheckQuantity(clampedValue === parsedValue ? value : clampedValue.toString());
	};

	const handleRemarksChange = (e) => {
		setRemarks(e.target.value); // Update the remarks state
	};

	const fetchDetails = async () => {
		setLoading(true);
		setNoWorkingDetails(false); // Reset before fetching
		setProductionDetails(null);
		setnextMachineDetails(null);
		try {
			const response = await fetchData(`ProcessingOrders/routesheet/${routeSheetNo}?statusflag=1`);
			console.log(response);
			if (!response || !response.details) {
				console.log('No details found for the route sheet.');
				setDetails(null);
				setCheckQuantity(0);
				setMachineQRCode('');
				setEmployeeDetails(null);
				setProductionDetails(null);
				setnextMachineDetails(null);
				setRouteSheetNo('');
				setMachineDetails(null);
				setShowInspectionStack(false);
				setAllProductionDetails(null);
				setNoWorkingDetails(true);
				enqueueSnackbar('No details are available for this Route Sheet', { variant: 'info' });
				setTimeout(() => {
					if (routeSheetRef.current) {
						routeSheetRef.current.focus();
					}
				}, 100);
			} else {
				setAllProductionDetails(response);
				const filteredDetails = response.details
					.sort((a, b) => a.operation_Number - b.operation_Number)
					.filter((detail) => detail.isWorking === 0 && detail.isCompleted === 0 && detail.isQC_Done === 0);
				setDetails({ ...response, details: filteredDetails });
				setCheckQuantity(filteredDetails[0].totalQunty || 0);
				setEmployeeDetails(null);
				setMachineDetails(null);
				setnextMachineDetails(null);
				setMachineQRCode('');
				setNextMachineQRCode('');
				const sortedDetails = [...filteredDetails].sort((a, b) =>
					a.operation_Code.localeCompare(b.operation_Number),
				);
				const hasInspectionCodes =
					sortedDetails.length > 0 && ['R', 'G', 'RFD'].includes(sortedDetails[0].operation_Code);
				console.log('hasInspectionCodes', hasInspectionCodes);
				if (hasInspectionCodes) {
					console.log('Inspection codes found for this route sheet.');
					// setDetails(null);
					setCheckQuantity(0);
					setMachineQRCode('');
					setEmployeeDetails(null);
					setProductionDetails(null);
					setnextMachineDetails(null);
					setMachineDetails(null);
					setShowInspectionStack(false);
					setNoWorkingDetails(true);
					setLoading(false);
					setRouteSheetNo('');
					setTimeout(() => {
						if (routeSheetRef.current) {
							routeSheetRef.current.focus();
						}
					}, 100);
					enqueueSnackbar('No details are available for this Route Sheet', { variant: 'info' });
					return;
				}
				setTimeout(() => {
					if (machineQRRef.current) {
						machineQRRef.current.focus();
					}
				}, 100);
				const hasRFI = sortedDetails.length > 0 && ['I'].includes(sortedDetails[0].operation_Code);
				setShowInspectionStack(hasRFI);
				setNoWorkingDetails(filteredDetails.length === 0);
			}
		} catch (e) {
			enqueueSnackbar(`Failed to fetch details: ${e.message}`, { variant: 'error' });
			setDetails(null);
			setCheckQuantity(0);
			setRouteSheetNo('');
			setShowInspectionStack(false);
			setNoWorkingDetails(true);
		} finally {
			setLoading(false);
		}
	};

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
				} else if (response.designation.includes('PROCESS')) {
					enqueueSnackbar('Employee found.', { variant: 'success' });
					setEmployeeDetails(response);
					console.log(response);
					setTimeout(() => {
						if (nextMachineQRRef.current) {
							nextMachineQRRef.current.focus();
						}
					}, 100);
				} else {
					enqueueSnackbar('Employee designation must be PROCESSCAPT.', { variant: 'error' });
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

	const handleMachineQRCodeChange = async (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			setLoading(true);
			try {
				const response = await fetchData(`MachineDetails/${machineQRCode}`);
				if (!response || response.message === 'Machine not found.') {
					enqueueSnackbar('Machine not found.', { variant: 'error' });
					setMachineQRCode('');
				} else {
					console.log(response);
					setMachineDetails(response);
					const machineOperationCodes = response.operationCode.split(', ').map((code) => code.trim());
					console.log('details.details', details.details);
					// Filter to keep ONLY matching operations
					const matchingOperations = details.details.filter((detail) =>
						machineOperationCodes.includes(detail.operation_Code),
					);
					console.log('matchingOperations', matchingOperations);

					// Check if any matching operations exist
					const hasNoMatchingOperation = matchingOperations.length > 0;
					if (!hasNoMatchingOperation) {
						enqueueSnackbar('No matching operation code found for this machine.', { variant: 'error' });
						setMachineQRCode(''); // Clear the machine field
						setMachineDetails(null); // Optionally reset machine details
						setTimeout(() => {
							if (machineQRRef.current) {
								machineQRRef.current.focus();
							}
						}, 100);
						return;
					}
					setDetails((prev) => ({ ...prev, details: matchingOperations }));
					try {
						const result = await fetchData(`ProductionOrders/${routeSheetNo}`);
						const filteredResponse = { ...result };
						if (filteredResponse.details) {
							const existingOperationCodeswithall = AllProductionDetails.details.map(
								(d) => d.operation_Code,
							);
							console.log('existingOperationCodeswithall', existingOperationCodeswithall);

							const existingOperationCodes = AllProductionDetails.details
								.filter((d) => d.isWorking === 0)
								.map((d) => d.operation_Code);

							console.log('existingOperationCodes', existingOperationCodes);

							const filteredDetailsIds = matchingOperations.map((detail) => detail.operation_Code);
							console.log('filteredDetailsIds', filteredDetailsIds);

							const remainingOperationCodes = existingOperationCodes.filter(
								(code) => !filteredDetailsIds.includes(code),
							);
							console.log('Remaining Operation Codes:', remainingOperationCodes);

							const mergedOperationCodes = [
								...new Set([...existingOperationCodes, ...filteredDetailsIds]),
							];
							console.log('Merged Operation Codes:', mergedOperationCodes);

							if (remainingOperationCodes.length > 0) {
								filteredResponse.details = filteredResponse.details.filter(
									(detail) =>
										remainingOperationCodes.includes(detail.operation_Code) &&
										!['I', 'R', 'G', 'RFD'].includes(detail.operation_Code),
								);
							} else {
								filteredResponse.details = filteredResponse.details.filter(
									(detail) =>
										!existingOperationCodeswithall.includes(detail.operation_Code) &&
										!['I', 'R', 'G', 'RFD'].includes(detail.operation_Code),
								);
							}

							console.log(filteredResponse.details);
						}
						setProductionDetails(filteredResponse);
						setTimeout(() => {
							if (personQRRef.current) {
								personQRRef.current.focus();
							}
						}, 100);
					} catch (err) {
						console.error('Error fetching details:', err);
						setProductionDetails(null);
						enqueueSnackbar('Error fetching details. Please check the Route Sheet No.', {
							variant: 'error',
						});
					}
				}
			} catch (ex) {
				if (ex.response && ex.response.status === 404) {
					enqueueSnackbar('Machine not found.', { variant: 'error' });
				} else if (ex.response && ex.response.status === 400) {
					enqueueSnackbar('Invalid request. Please check the QR code.', { variant: 'error' });
				} else {
					enqueueSnackbar(`Failed to fetch details: ${ex.message}`, { variant: 'error' });
				}
				setMachineQRCode('');
			} finally {
				setLoading(false);
			}
		}
	};

	const getRowStyles = (operationCode, machineDetails) => {
		if (!machineDetails?.operationCode) return {};

		const machineCodes = machineDetails.operationCode.split(', ').map((code) => code.trim());
		return machineCodes.includes(operationCode)
			? { backgroundColor: '#fff9c4' } // Light yellow color
			: {};
	};

	const handleNextMachineQRCodeChange = async (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			setLoading(true);
			try {
				const response = await fetchData(`MachineDetails/${nextMachineQRCode}`);

				if (!response || response.message === 'Machine not found.') {
					enqueueSnackbar('Machine not found.', { variant: 'error' });
					setNextMachineQRCode('');
					setnextMachineDetails(null);
				} else {
					console.log(response);
					setnextMachineDetails(response);
					const machineOperationCodes = response.operationCode.split(', ').map((code) => code.trim());
					const filteredOperationCodes = productionDetails.details.map((detail) => detail.operation_Code);
					console.log(filteredOperationCodes);
					const hasMatchingOperation = machineOperationCodes.some((code) =>
						filteredOperationCodes.includes(code),
					);
					if (!hasMatchingOperation) {
						enqueueSnackbar('No matching operation code found for this machine.', { variant: 'error' });
						setNextMachineQRCode(''); // Clear the machine field
						setnextMachineDetails(null); // Optionally reset machine details
						return;
					}
					enqueueSnackbar('Machine found.', { variant: 'success' });
				}
			} catch (ex) {
				if (ex.response && ex.response.status === 404) {
					enqueueSnackbar('Machine not found.', { variant: 'error' });
				} else if (ex.response && ex.response.status === 400) {
					enqueueSnackbar('Invalid request. Please check the QR code.', { variant: 'error' });
				} else {
					enqueueSnackbar(`Failed to fetch details: ${ex.message}`, { variant: 'error' });
				}
				setNextMachineQRCode('');
			} finally {
				setLoading(false);
			}
		}
	};

	const handleSave = async () => {
		setLoading(true);

		if (!details || !employeeDetails || !machineDetails || !checkQuantity) {
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
				machineNo: machineDetails.machineID,
				nextMachineNo: nextmachineDetails?.machineID,
				remarks,
				details: details.details, // Use the filtered details here
			};

			await createResource(
				'ProcessingOrders/save',
				dataToSend,
				() => {
					enqueueSnackbar('Production Order created successfully', { variant: 'success' });
					setRouteSheetNo('');
					setDetails(null);
					setPersonQRCode('');
					setCheckQuantity(0);
					setMachineQRCode('');
					setnextMachineDetails(null);
					setProductionDetails(null);
					setAllProductionDetails(null);
					setEmployeeDetails(null);
					setMachineDetails(null);
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
			setMachineQRCode('');
			setEmployeeDetails(null);
			setMachineDetails(null);
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
					setProductionDetails(null);
					setCheckQuantity(0);
					setMachineQRCode('');
					setEmployeeDetails(null);
					setMachineDetails(null);
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
			setMachineQRCode('');
			setEmployeeDetails(null);
			setMachineDetails(null);
			setRemarks('NA'); // Reset remarks to default
			setShowInspectionStack(false);
			setNoWorkingDetails(true);
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
		console.log(routeSheetNo);
		setIconLoading(true);
		setIconError(null);
		setIconData(null);
		setInfoModalOpen(true);

		try {
			const response = await fetchData(`ProcessingOrders/routesheet/${routeSheetNo}?statusflag=1`);
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
							Process Capture
						</Typography>
						<Typography variant="body1" color="text.secondary">
							Scan the route sheet below to capture for production.
						</Typography>
					</Stack>
				</Stack>

				<Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mb: 2 }}>
					<TextField
						label="Route Sheet No"
						variant="outlined"
						fullWidth
						inputRef={routeSheetRef}
						value={routeSheetNo}
						onChange={handleInputChange}
						placeholder="Scan or Enter Route Sheet No"
						onKeyDown={handleKeyDown}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<IconButton onClick={handleIconClick}>
										<InfoOutlined />
									</IconButton>
								</InputAdornment>
							),
						}}
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
					/>
				</Box>

				{loading && (
					<Box display="flex" justifyContent="center" alignItems="center" my={2}>
						<CircularProgress />
					</Box>
				)}

				{noWorkingDetails && !loading && (
					<>
						<Alert variant="filled" severity="warning">
							No operations available for the current route sheet {routeSheetNo}
						</Alert>
						<Typography variant="h4" color="initial" m={2}>
							Pending Operations
						</Typography>
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
										<TableRow
											key={detail.id}
											style={getRowStyles(detail.operation_Code, machineDetails)}
										>
											<TableCell>{detail.operation_Number}</TableCell>
											<TableCell>{detail.operation_Code}</TableCell>
											<TableCell>{detail.operation_Description}</TableCell>
											<TableCell>{detail.totalQunty}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</>
				)}

				{!loading && details && !showInspectionStack && !noWorkingDetails && (
					<>
						<Grid container spacing={2} mb={2}>
							<Grid item xs={12} sm={6} md={3} lg={3}>
								<TextField
									label="Machine Code"
									variant="outlined"
									fullWidth
									sx={{
										'& .MuiOutlinedInput-root': {
											backgroundColor: '#EEEEEE', // Light gray
											'&:hover .MuiOutlinedInput-notchedOutline': {
												borderColor: '#424242',
											},
											'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
												borderColor: '#424242',
											},
										},
										'& .MuiInputLabel-outlined': {
											color: '#424242',
											'&.Mui-focused': {
												color: '#424242',
												fontWeight: 'bold',
											},
										},
										'& .MuiOutlinedInput-input': {
											color: '#212121',
											'&::placeholder': {
												color: '#9E9E9E',
												opacity: 1,
											},
										},
									}}
									inputRef={machineQRRef}
									value={machineQRCode}
									onChange={(e) => setMachineQRCode(e.target.value)}
									placeholder="Scan or Enter Machine Code"
									onKeyDown={handleMachineQRCodeChange}
								/>
							</Grid>

							<Grid item xs={12} sm={6} md={3} lg={3}>
								<TextField
									label="Check Quantity"
									variant="outlined"
									fullWidth
									type="number"
									value={checkQuantity}
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
							</Grid>

							<Grid item xs={12} sm={6} md={3} lg={3}>
								<TextField
									label="Person QR Code"
									variant="outlined"
									fullWidth
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
									inputRef={personQRRef}
									value={personQRCode}
									onChange={handlePersonQRCodeChange}
									placeholder="Scan Person QR Code"
									onKeyDown={validPersonQRCode}
								/>
							</Grid>

							{productionDetails &&
								productionDetails.details &&
								productionDetails.details.length > 0 &&
								details &&
								details.details &&
								details.details.length > 0 &&
								details.details.some((detail) => detail.totalQunty === Number(checkQuantity)) && (
									<Grid item xs={12} sm={6} md={3} lg={3}>
										<TextField
											label="Next Machine Code"
											variant="outlined"
											fullWidth
											inputRef={nextMachineQRRef}
											value={nextMachineQRCode}
											onChange={(e) => setNextMachineQRCode(e.target.value)}
											placeholder="Scan or Enter Machine Code"
											onKeyDown={handleNextMachineQRCodeChange}
											sx={{
												'& .MuiOutlinedInput-root': {
													backgroundColor: '#FFF3E0', // Light coral
													'&:hover .MuiOutlinedInput-notchedOutline': {
														borderColor: '#E64A19',
													},
													'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
														borderColor: '#E64A19',
													},
												},
												'& .MuiInputLabel-outlined': {
													color: '#E64A19',
													'&.Mui-focused': {
														color: '#E64A19',
														fontWeight: 'bold',
													},
												},
												'& .MuiOutlinedInput-input': {
													color: '#BF360C',
													'&::placeholder': {
														color: '#FF8A65',
														opacity: 1,
													},
												},
											}}
										/>
									</Grid>
								)}
						</Grid>

						{/* Remarks Field */}
						<TextField
							label="Remarks"
							variant="outlined"
							fullWidth
							multiline
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
							rows={2}
							value={remarks}
							onChange={handleRemarksChange}
							placeholder="Enter Remarks"
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
										<TableRow
											key={detail.id}
											style={getRowStyles(detail.operation_Code, machineDetails)}
										>
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
								confirmText="Are you sure you want to Save this Process Check?"
							/>
						</Box>
					</>
				)}

				{showInspectionStack && details && (
					<Stack
						sx={{
							borderRadius: 1,
							border: 2,
							borderColor: 'green',
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
							confirmText="Are you sure you want to Send For  RFI"
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
														{iconData.details
															.sort((a, b) => a.operation_Number - b.operation_Number)
															.map((detail) => {
																let backgroundColor = 'inherit';
																let quantityDisplay = detail.totalQunty;

																if (
																	detail.isCompleted === 1 &&
																	detail.isWorking === 1
																) {
																	if (detail.isQC_Done === 1) {
																		backgroundColor = '#C6F4D6'; // Green
																	} else if (detail.isQC_Done === 0) {
																		backgroundColor = '#FFF3CD'; // Yellow
																		quantityDisplay = `${detail.totalQunty} (QC Pending)`;
																	}
																}

																return (
																	<TableRow key={detail.id} sx={{ backgroundColor }}>
																		<TableCell>{detail.operation_Number}</TableCell>
																		<TableCell>{detail.operation_Code}</TableCell>
																		<TableCell>
																			{detail.operation_Description}
																		</TableCell>
																		<TableCell>{quantityDisplay}</TableCell>
																	</TableRow>
																);
															})}
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

export default ProcessQCCheck;
