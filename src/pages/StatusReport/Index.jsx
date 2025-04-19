import React, { useEffect, useState } from 'react';
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
	Select,
	MenuItem, // Import TableContainer
} from '@mui/material';
import PageHeader from '@/components/pageHeader';

import { CloseOutlined } from '@mui/icons-material';
import dayjs from 'dayjs';
import DataTable from '@/components/dataTable/Example';
import { useApi } from '@/services/machineAPIService';
import { enqueueSnackbar } from 'notistack';
import PageImpressionsCard from './pageImpressionsCard';
import ActivitiesCard from './activitiesCard';
import CustomersOverviewCard from './customerCard';
import SalesOverviewCard from './salesOverviewCard';
import SaleProgressCard from './saleProgressCard';
import MostVisitedCard from './mostVisitedCard';

function StatusReport() {
	return (
		<>
			<PageHeader title="Status Report">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Reports</Typography>
					<Typography color="text.secondary">Status Report</Typography>
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
	const [isCuttingLoading, setIsCuttingLoading] = useState(false);
	const [error, setError] = useState(null);
	const [modalData, setModalData] = useState(null);
	const [open, setOpen] = useState(false);
	const [cuttingData, setCuttingData] = useState(null);
	const [cuttingOpen, setCuttingOpen] = useState(false);

	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

	const fetchDetails = async (routeSheetNo) => {
		try {
			const response = await fetchData(`StatusReports/${routeSheetNo}`);
			setModalData(response);
			setOpen(true);
		} catch (err) {
			enqueueSnackbar('Error fetching details:', { variant: 'error' });
			setOpen(false);
		}
	};

	const refetch = async () => {
		setIsLoading(true);
		try {
			const fetchedData = await fetchData(endpoint);
			console.log(fetchedData);
			setData(fetchedData);
			setError(null);
		} catch (err) {
			setError(err);
			setData([]);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchCuttingDetails = async (cuttingNo) => {
		setIsCuttingLoading(true);
		try {
			const response = await fetchData(`Report/GetCuttingSummary?cuttingNo=${cuttingNo}`);
			console.log(response);
			setCuttingData(response);
			setCuttingOpen(true);
		} catch (err) {
			enqueueSnackbar('Error fetching details:', { variant: 'error' });
			setCuttingOpen(false);
		} finally {
			setIsCuttingLoading(false);
		}
	};

	useEffect(() => {
		refetch();
	}, [endpoint]);

	const handleCloseModal = () => {
		setOpen(false);
		setModalData(null);
	};

	const handleCloseCuttingModal = () => {
		setCuttingOpen(false);
		setCuttingData(null);
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
			Cell: ({ cell }) => (
				<Button
					variant="text"
					color="primary"
					onClick={() => fetchCuttingDetails(cell.getValue())}
					sx={{ textTransform: 'none' }}
				>
					{cell.getValue()}
				</Button>
			),
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
			// Filter configuration
			filterFn: (row, columnId, filterValue) => {
				if (filterValue === 'all') return true;
				return row.original.isCompleted.toString() === filterValue;
			},
			// Filter component
			Filter: ({ column }) => (
				<Select
					size="small"
					value={column.getFilterValue() || 'all'}
					onChange={(e) => column.setFilterValue(e.target.value)}
					displayEmpty
					fullWidth
				>
					<MenuItem value="all">All Statuses</MenuItem>
					<MenuItem value="0">IN-PROCESS</MenuItem>
					<MenuItem value="1">COMPLETED</MenuItem>
					<MenuItem value="2">ON-HOLD</MenuItem>
				</Select>
			),
			// Existing Cell render
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
			header: 'SFR Date',
			size: 100,
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
							Status Report
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
					Status of {modalData ? modalData[0]?.routeSheetNo : ''}
					<IconButton
						aria-label="close"
						onClick={handleCloseModal}
						sx={{ position: 'absolute', right: 8, top: 8 }}
					>
						<CloseOutlined />
					</IconButton>
				</DialogTitle>
				<Divider />
				<DialogContent sx={{ p: 0 }}>
					{modalData ? (
						<TableContainer sx={{ maxHeight: 400 }}>
							{' '}
							{/* Add TableContainer with maxHeight */}
							<Table stickyHeader size="small">
								{' '}
								{/* Add stickyHeader prop */}
								<TableHead>
									<TableRow>
										<TableCell>
											<strong>Date</strong>
										</TableCell>
										<TableCell>
											<strong>Status</strong>
										</TableCell>
										<TableCell>
											<strong>Short Code</strong>
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{modalData.map((detail, index) => (
										<TableRow key={index}>
											<TableCell>
												{dayjs(detail.createdDate).format('DD-MM-YYYY HH:mm:ss')}
											</TableCell>
											<TableCell>
												<Typography textTransform="uppercase">{detail.status}</Typography>
											</TableCell>
											<TableCell>
												<Chip
													textTransform="uppercase"
													label={detail.statusCode.toUpperCase()}
													color="primary"
												/>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					) : (
						<Typography variant="body2">No production details available.</Typography>
					)}
				</DialogContent>
			</Dialog>

			<Dialog
				open={cuttingOpen}
				onClose={handleCloseCuttingModal}
				maxWidth="lg"
				fullScreen={fullScreen}
				fullWidth
			>
				<DialogTitle variant="h4" bgcolor={'primary.paper'}>
					All Details of Cutting No {cuttingData?.cuttingNo || ''}
					<IconButton
						aria-label="close"
						onClick={handleCloseCuttingModal}
						sx={{ position: 'absolute', right: 8, top: 8 }}
					>
						<CloseOutlined />
					</IconButton>
				</DialogTitle>
				<Divider />
				<DialogContent sx={{ p: 2 }}>
					{isCuttingLoading ? (
						<Box display="flex" justifyContent="center" alignItems="center" height="200px">
							<CircularProgress />
						</Box>
					) : (
						<>
							{cuttingData ? (
								<Grid container spacing={3}>
									<Grid
										item
										xs={12}
										sm={6}
										md={3}
										order={{
											xs: 2,
											sm: 1,
											md: 1,
										}}
									>
										<Stack spacing={3} direction="column">
											<PageImpressionsCard cuttingData={cuttingData} />
											<SaleProgressCard cuttingData={cuttingData} />
											{/* <SalesOverviewCard cuttingData={cuttingData} /> */}
										</Stack>
									</Grid>
									<Grid
										item
										xs={12}
										sm={12}
										md={6}
										order={{
											xs: 1,
											sm: 4,
											md: 2,
										}}
									>
										<Stack spacing={3} direction="column">
											<CustomersOverviewCard cuttingData={cuttingData} />

											{/* <ShareThougts /> */}
										</Stack>
									</Grid>
									<Grid item xs={12} sm={6} md={3} order={3}>
										<Stack spacing={3} direction="column">
											<MostVisitedCard cuttingData={cuttingData} />
										</Stack>
									</Grid>
								</Grid>
							) : (
								<Typography variant="body2">No cutting details available.</Typography>
							)}
						</>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}

export default StatusReport;
