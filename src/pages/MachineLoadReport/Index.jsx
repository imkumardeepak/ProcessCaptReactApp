import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/pageHeader';
import {
	Box,
	Breadcrumbs,
	Card,
	Chip,
	CircularProgress,
	Stack,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	DialogTitle,
	IconButton,
	Dialog,
	TextField,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useApi } from '@/services/machineAPIService';
import DataTable from '@/components/dataTable/Example';
import { CloseOutlined } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';

// Time Difference Component
function TimeDifferenceCell({ releaseDate }) {
	const [timeDiff, setTimeDiff] = useState('-');
	const [isOverThreshold, setIsOverThreshold] = useState(false);

	useEffect(() => {
		if (!releaseDate) return;

		const calculateDifference = () => {
			try {
				const releaseTime = new Date(releaseDate).getTime();
				const currentTime = new Date().getTime();

				if (isNaN(releaseTime)) {
					setTimeDiff('Invalid date');
					return;
				}

				const diffMs = currentTime - releaseTime;
				const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

				setIsOverThreshold(diffDays > 2);

				const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
				const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

				setTimeDiff(`${diffDays}d ${diffHrs}h ${diffMins}m`);
			} catch (error) {
				setTimeDiff('Error');
			}
		};

		calculateDifference();
		const interval = setInterval(calculateDifference, 60000);

		return () => clearInterval(interval);
	}, [releaseDate]);

	return (
		<Typography
			variant="body2"
			sx={{
				backgroundColor: isOverThreshold ? '#d32f2f' : 'green',
				color: '#fff',
				padding: '4px 8px',
				borderRadius: '4px',
				display: 'inline-block',
			}}
		>
			{timeDiff}
		</Typography>
	);
}

function MachineLoadReport() {
	return (
		<>
			<PageHeader title="Machine Load Reports">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Reports</Typography>
					<Typography color="text.secondary">Machine Load Report</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<DataTableSection name="Machine Load Report" endpoint="Report/GetMachineLoadStatus" />
			</Box>
		</>
	);
}

function DataTableSection({ name, endpoint }) {
	const { fetchData } = useApi();
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [selectedMachine, setSelectedMachine] = useState(null);
	const [open, setOpen] = useState(false);
	const [filters, setFilters] = useState({
		fromDate: dayjs(), // Today: June 10, 2025
		toDate: dayjs(), // Today: June 10, 2025
	});

	const refetch = async () => {
		setIsLoading(true);
		try {
			const fromDate = filters.fromDate.format('YYYY-MM-DD');
			const toDate = filters.toDate.format('YYYY-MM-DD');
			const queryParams = new URLSearchParams({
				fromDate,
				toDate,
			}).toString();
			const fetchedData = await fetchData(`${endpoint}?${queryParams}`);
			setData(fetchedData || []);
			console.log('Fetched data:', fetchedData);
			setError(null);
		} catch (err) {
			console.error('Fetch error:', err);
			setError(err.message);
			setData([]);
			enqueueSnackbar(`Failed to load data: ${err.message}`, { variant: 'error' });
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		refetch();
	}, [filters.fromDate, filters.toDate, endpoint]);

	const handleOpen = (machine) => {
		setSelectedMachine(machine);
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		setSelectedMachine(null);
	};

	const columns = [
		{
			accessorKey: 'machineNo',
			header: 'Machine Code',
			size: 300,
			Cell: ({ cell }) => (
				<Typography
					sx={{
						cursor: 'pointer',
						color: 'primary.main',
						textDecoration: 'underline',
						'&:hover': { color: 'primary.dark' },
					}}
					onClick={() => handleOpen(cell.row.original)}
				>
					{cell.getValue() || 'N/A'}
				</Typography>
			),
		},
		{
			accessorKey: 'routeSheet',
			header: 'Total Sheet',
			size: 300,
		},
		{
			accessorKey: 'totalWT',
			header: 'Total Wt',
			size: 300,
			Cell: ({ cell }) => {
				const value = parseFloat(cell.getValue());
				const formattedValue = isNaN(value) ? '0' : value.toFixed(3).replace(/\.?0+$/, '');
				return <Chip label={`${formattedValue} Kgs`} size="small" color="success" />;
			},
		},
	];

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<Card>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
					<Stack>
						<Typography variant="h4" fontWeight="500" textTransform="uppercase">
							{name}
						</Typography>
						<Typography variant="body1" color="text.secondary">
							See the {name}.
						</Typography>
					</Stack>
					<Stack direction="row" spacing={2}>
						<DatePicker
							label="From Date"
							value={filters.fromDate}
							onChange={(value) => setFilters((prev) => ({ ...prev, fromDate: value }))}
							renderInput={(params) => <TextField {...params} size="small" />}
						/>
						<DatePicker
							label="To Date"
							value={filters.toDate}
							onChange={(value) => setFilters((prev) => ({ ...prev, toDate: value }))}
							renderInput={(params) => <TextField {...params} size="small" />}
							minDate={filters.fromDate}
						/>
					</Stack>
				</Box>
				<Box p={2}>
					{isLoading ? (
						<Box display="flex" justifyContent="center" alignItems="center" height="200px">
							<CircularProgress />
						</Box>
					) : error ? (
						<Box display="flex" justifyContent="center" alignItems="center" height="200px">
							<Typography variant="h6" color="error">
								Failed to load data: {error}
							</Typography>
						</Box>
					) : (
						<DataTable columns={columns} data={data} />
					)}
				</Box>
			</Card>

			<Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
				<Box sx={{ p: 2 }}>
					{selectedMachine && (
						<>
							<DialogTitle variant="h5" bgcolor={'primary.paper'} sx={{ p: 0, mb: 2 }}>
								Details for {selectedMachine.machineNo}
								<IconButton
									aria-label="close"
									onClick={handleClose}
									sx={{ position: 'absolute', right: 8, top: 8 }}
								>
									<CloseOutlined />
								</IconButton>
							</DialogTitle>
							<Stack spacing={1}>
								<Card variant="outlined" sx={{ p: 0 }}>
									<Typography variant="subtitle1" p={1} bgcolor="action.hover">
										Basic Information
									</Typography>
									<Box p={2}>
										<Typography>Total Sheets: {selectedMachine.routeSheet}</Typography>
										<Typography>
											Total Weight: {`${parseFloat(selectedMachine.totalWT || 0).toFixed(2)} Kgs`}
										</Typography>
									</Box>
								</Card>

								<Card variant="outlined" sx={{ p: 0 }}>
									<TableContainer component={Paper}>
										<Table size="small" sx={{ minWidth: 650 }}>
											<TableHead>
												<TableRow>
													<TableCell>Route Sheet</TableCell>
													<TableCell>SPF.Rel Date</TableCell>
													<TableCell>Time Elapsed</TableCell>
													<TableCell>Cutting No</TableCell>
													<TableCell>Weight</TableCell>
													<TableCell>Qty</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{selectedMachine.details?.map((detail, index) => (
													<TableRow key={index}>
														<TableCell>{detail.routeSheet || '-'}</TableCell>
														<TableCell>
															{detail.releaseDate
																? new Date(detail.releaseDate).toLocaleString('en-IN', {
																		day: '2-digit',
																		month: '2-digit',
																		year: 'numeric',
																		hour: '2-digit',
																		minute: '2-digit',
																	})
																: '-'}
														</TableCell>
														<TableCell>
															{detail.releaseDate ? (
																<TimeDifferenceCell releaseDate={detail.releaseDate} />
															) : (
																'-'
															)}
														</TableCell>
														<TableCell>{detail.cuttingNo || '-'}</TableCell>
														<TableCell>
															<Chip
																label={`${parseFloat(detail.totalWeight || 0).toFixed(2)} Kgs`}
																size="small"
																color="secondary"
															/>
														</TableCell>
														<TableCell>
															<Chip
																label={detail.totalQunty || 0}
																size="small"
																color="primary"
															/>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								</Card>
							</Stack>
						</>
					)}
				</Box>
			</Dialog>
		</LocalizationProvider>
	);
}

export default MachineLoadReport;
