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
	useMediaQuery, // Import TableContainer
} from '@mui/material';
import PageHeader from '@/components/pageHeader';

import { CloseOutlined } from '@mui/icons-material';
import dayjs from 'dayjs';
import DataTable from '@/components/dataTable/Example';
import { useApi } from '@/services/machineAPIService';
import { enqueueSnackbar } from 'notistack';

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
				<DataTableSection name="Status Report" endpoint="ProcessingOrders\statusreport" />
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

	useEffect(() => {
		refetch();
	}, [endpoint]);

	const handleCloseModal = () => {
		setOpen(false);
		setModalData(null);
	};

	const columns = [
		{
			header: '#',
			Cell: ({ row }) => row.index + 1,
			size: 30,
		},
		{
			accessorKey: 'process_Date',
			header: 'Date',
			size: 100,
			Cell: ({ cell }) => dayjs(cell.getValue()).format('DD-MM-YYYY'),
		},
		{ accessorKey: 'cuttingNo', header: 'Cutting No', size: 100 },
		{
			accessorKey: 'routeSheetNo',
			header: 'Sheet No',
			size: 140,
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
		// { accessorKey: 'subRouteSheetNo', header: 'SubRouteSheetNo ', size: 210 },
		{ accessorKey: 'totalQunty', header: 'TQ', size: 100 },
		{ accessorKey: 'pendingQunty', header: 'BQ', size: 100 },
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
			size: 170,
			Cell: ({ row }) => <Chip label={row.original.nextCode.toUpperCase()} color="error" size="small" />,
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
		</>
	);
}

export default StatusReport;
