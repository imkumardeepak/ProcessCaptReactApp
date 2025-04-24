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
	styled,
} from '@mui/material';
import { useSnackbar } from 'notistack'; // Import useSnackbar
import { useApi } from '@/services/machineAPIService';
import useCurrentShift from '@/utils/hooks/useCurrentShift';
import ConfirmButton from '@/components/ConfirmationBox/ConfirmButton';

function ProcessQCCheckBulk() {
	return (
		<>
			<PageHeader title="Process Capture Bulk">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Operations</Typography>
					<Typography color="text.secondary">Process Capture Bulk</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<QCCheckFormBulk />
			</Box>
		</>
	);
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
	fontWeight: 'bold',
	color: theme.palette.primary.main,
}));

function QCCheckFormBulk() {
	const { fetchData, createResource } = useApi();
	const [routeSheetNo, setRouteSheetNo] = useState('');
	const [details, setDetails] = useState([]);
	const [loading, setLoading] = useState(false);
	const [machineQRCode, setMachineQRCode] = useState('');
	const [machineDetails, setMachineDetails] = useState(null);
	const [machineOperationCodes, setMachineOperationCodes] = useState([]);
	const [employeeDetails, setEmployeeDetails] = useState(null);
	const [personQRCode, setPersonQRCode] = useState('');
	const [nextmachineDetails, setnextMachineDetails] = useState(null);
	const [remarks, setRemarks] = useState('NA');

	const currentShift = useCurrentShift();

	const { enqueueSnackbar } = useSnackbar(); // Use the hook

	const routeSheetRef = useRef(null);
	const machineQRRef = useRef(null);
	const personQRRef = useRef(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (machineQRRef.current) {
				machineQRRef.current.focus();
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

	const handleRemarksChange = (e) => {
		setRemarks(e.target.value); // Update the remarks state
	};

	const fetchDetails = async () => {
		setLoading(true);
		try {
			const response = await fetchData(`ProcessingOrders/routesheet/${routeSheetNo}?statusflag=1`);
			if (!response || !response.details) {
				console.log('No details found for the route sheet.');
				setRouteSheetNo('');
				enqueueSnackbar('No details are available for this Route Sheet', { variant: 'info' });
				setTimeout(() => {
					if (routeSheetRef.current) {
						routeSheetRef.current.focus();
					}
				}, 100);
			} else {
				const filteredDetails = response.details.filter(
					(detail) => detail.isWorking === 0 && detail.isCompleted === 0 && detail.isQC_Done === 0,
				);
				const hasMatchingOperation = machineOperationCodes.some((code) =>
					filteredDetails.map((detail) => detail.operation_Code).includes(code),
				);
				if (!hasMatchingOperation) {
					enqueueSnackbar('No matching operation code found for this machine.', { variant: 'error' });
					setRouteSheetNo('');
					setTimeout(() => {
						if (routeSheetRef.current) {
							routeSheetRef.current.focus();
						}
					}, 100);
					return;
				}
				const addDetail = (newDetail) => {
					setDetails((prevDetails) => {
						if (prevDetails.length >= 50) {
							enqueueSnackbar('Maximum 50 route sheets allowed!', {
								variant: 'error',
								autoHideDuration: 2000,
							});
							return prevDetails;
						}

						const exists = prevDetails.some((item) => item.routeSheetNo === newDetail.routeSheetNo);

						if (exists) {
							enqueueSnackbar('Route sheet already exists!', {
								variant: 'warning',
								autoHideDuration: 2000,
							});
							return prevDetails;
						}

						enqueueSnackbar('Route sheet added successfully!', {
							variant: 'success',
							autoHideDuration: 2000,
						});

						return [...prevDetails, newDetail];
					});
				};

				addDetail(response);
				setRouteSheetNo('');
				setTimeout(() => {
					if (routeSheetRef.current) {
						routeSheetRef.current.focus();
					}
				}, 100);
			}
		} catch (e) {
			enqueueSnackbar(`Failed to fetch details: ${e.message}`, { variant: 'error' });
			setRouteSheetNo('');
			setTimeout(() => {
				if (routeSheetRef.current) {
					routeSheetRef.current.focus();
				}
			}, 100);
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
				} else if (response.designation.includes('PROCESSCAPT') || response.designation.includes('ADMIN')) {
					enqueueSnackbar('Employee found.', { variant: 'success' });
					setEmployeeDetails(response);
					console.log(response);
					setTimeout(() => {
						if (routeSheetRef.current) {
							routeSheetRef.current.focus();
						}
					}, 100);
				} else {
					enqueueSnackbar('Employee designation must be PROCESSCAPT or ADMIN.', { variant: 'error' });
					setPersonQRCode('');
					setTimeout(() => {
						if (personQRRef.current) {
							personQRRef.current.focus();
						}
					}, 100);
				}
			} catch (ex) {
				setTimeout(() => {
					if (personQRRef.current) {
						personQRRef.current.focus();
					}
				}, 100);
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
					setMachineOperationCodes(machineOperationCodes);
					enqueueSnackbar('Machine found.', { variant: 'success' });
					setTimeout(() => {
						if (personQRRef.current) {
							personQRRef.current.focus();
						}
					}, 100);
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

	const handleSave = async () => {
		setLoading(true);

		if (!details.length > 0 || !employeeDetails || !machineDetails) {
			enqueueSnackbar('Please scan all the details first...', { variant: 'warning' });
			setLoading(false);
			return;
		}

		try {
			const dataToSend = {
				orders: details,
				personQRCode: employeeDetails.empName,
				shift: currentShift,
				machineNo: machineDetails.machineID,
				nextMachineNo: nextmachineDetails?.machineID,
				remarks: remarks || 'NA',
			};

			await createResource(
				'ProcessingOrders/Bulksave',
				dataToSend,
				() => {
					enqueueSnackbar('Production Order created successfully', { variant: 'success' });
					setRouteSheetNo('');
					setDetails(null);
					setPersonQRCode('');
					setMachineQRCode('');
					setnextMachineDetails(null);
					setEmployeeDetails(null);
					setMachineDetails(null);
					setRemarks('NA'); // Reset remarks to default
				},
				(error) => enqueueSnackbar(`Failed to create Production Order: ${error.message}`, { variant: 'error' }),
			);
		} catch (e) {
			enqueueSnackbar(`Failed to save data: ${e.message}`, { variant: 'error' });
			setRouteSheetNo('');
			setDetails(null);
			setPersonQRCode('');
			setMachineQRCode('');
			setEmployeeDetails(null);
			setMachineDetails(null);
			setRemarks('NA'); // Reset remarks to default
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<Box sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
					<Stack>
						<Typography variant="h5" fontWeight="500" textTransform="uppercase">
							Process Capture Bulk
						</Typography>
						<Typography variant="body1" color="text.secondary">
							Scan the route sheet below to capture for production bulk.
						</Typography>
					</Stack>
				</Stack>
				<Grid container spacing={2} mb={2}>
					<Grid item xs={12} sm={6} md={3} lg={3}>
						<TextField
							label="Machine Code"
							variant="outlined"
							fullWidth
							inputRef={machineQRRef}
							value={machineQRCode}
							onChange={(e) => setMachineQRCode(e.target.value)}
							placeholder="Scan or Enter Machine Code"
							onKeyDown={handleMachineQRCodeChange}
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
						/>
					</Grid>

					<Grid item xs={12} sm={6} md={3} lg={3}>
						<TextField
							label="Person QR Code"
							variant="outlined"
							fullWidth
							inputRef={personQRRef}
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
					</Grid>
					<Grid item xs={12} sm={6} md={6} lg={6}>
						<TextField
							label="Remarks"
							variant="outlined"
							fullWidth
							value={remarks}
							onChange={handleRemarksChange}
							placeholder="Enter Remarks"
							sx={{
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
					</Grid>
				</Grid>
				<Grid container spacing={2} mb={2}>
					<Grid item xs={12} sm={12} md={12} lg={12}>
						<TextField
							label="Route Sheet No"
							variant="outlined"
							fullWidth
							inputRef={routeSheetRef}
							autoComplete="off"
							autoCorrect="off"
							spellCheck={false}
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
						/>
					</Grid>
				</Grid>

				{loading && (
					<Box display="flex" justifyContent="center" alignItems="center" my={2}>
						<CircularProgress />
					</Box>
				)}

				{!loading && details && details.length > 0 && (
					<>
						<TableContainer component={Paper}>
							<Table sx={{ minWidth: 650 }} aria-label="simple table">
								<TableHead>
									<TableRow>
										<StyledTableCell>Route Sheet No</StyledTableCell>
										<StyledTableCell>Quantity</StyledTableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{details?.map((detail) => (
										<TableRow key={detail.id}>
											<TableCell>{detail.routeSheetNo}</TableCell>
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
			</Box>
		</Card>
	);
}

export default ProcessQCCheckBulk;
