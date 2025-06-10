import DataTable from '@/components/dataTable/Example';
import PageHeader from '@/components/pageHeader';
import { useApi } from '@/services/machineAPIService';
import { Box, Breadcrumbs, Card, Chip, CircularProgress, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

function RouteSheetSummaryReport() {
	return (
		<>
			<PageHeader title="Route Sheet Summary Report">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Reports</Typography>
					<Typography color="text.secondary">Pending Route Sheet Report</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<DataTableSection name="Pending Route Sheet Report" endpoint="Report/routesheetsummaryreport" />
			</Box>
		</>
	);
}

function DataTableSection({ name, endpoint }) {
	const { fetchData } = useApi();
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
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
			setData(fetchedData);
			console.log(fetchedData);
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
	}, [filters.fromDate, filters.toDate, endpoint]);

	const columns = [
		{
			accessorKey: 'planningIssue',
			header: 'SFR Date',
			size: 120,
			enableSorting: false,
		},
		{
			accessorKey: 'projectCode',
			header: 'Project Code',
			size: 80,
			enableSorting: false,
		},
		{
			accessorKey: 'workOrder',
			header: 'Work Order',
			size: 110,
			enableSorting: false,
		},
		{
			accessorKey: 'cutting',
			header: 'Cutting Instruction',
			size: 110,
			enableSorting: false,
		},
		{
			accessorKey: 'routeSheet',
			header: 'Route Sheet',
			size: 120,
			Cell: ({ cell }) => <Chip label={cell.getValue() || 'N/A'} size="small" color="success" />,
			enableSorting: false,
		},
		{
			accessorKey: 'markNo',
			header: 'Mark No',
			size: 140,
			enableSorting: false,
		},
		{
			accessorKey: 'section',
			header: 'Section',
			size: 180,
			enableSorting: false,
		},
		{
			accessorKey: 'pendingOperation',
			header: 'Pending Operations',
			size: 150,
			Cell: ({ cell }) => <Chip label={cell.getValue() || 'None'} size="small" color="error" />,
			enableSorting: false,
		},
		{
			accessorKey: 'qnty',
			header: 'Qty',
			size: 100,
			enableSorting: false,
		},
		{
			accessorKey: 'wtperPc',
			header: 'Wt/Pcs',
			size: 100,
			enableSorting: false,
		},
		{
			accessorKey: 'totalWt',
			header: 'Weight',
			size: 120,
			enableSorting: false,
		},
		{
			accessorKey: 'length',
			header: 'Length',
			size: 100,
			enableSorting: false,
		},
		{
			accessorKey: 'width',
			header: 'Width',
			size: 100,
			enableSorting: false,
		},
		{
			accessorKey: 'batch',
			header: 'Batch',
			size: 110,
			Cell: ({ row }) => {
				const batches = row.original.batchDetails || [];
				const batchList = batches.map((item) => item.batchNo).join(', ') || 'N/A';
				return (
					<Tooltip title={batchList}>
						<span>{batchList}</span>
					</Tooltip>
				);
			},
		},
		{
			accessorKey: 'cip',
			header: 'CIP',
			size: 110,
			Cell: ({ row }) => {
				const batches = row.original.batchDetails || [];
				const batchList = batches.map((item) => item.ciP_Number).join(', ') || 'N/A';
				return (
					<Tooltip title={batchList}>
						<span>{batchList}</span>
					</Tooltip>
				);
			},
		},
		{
			accessorKey: 'embosing',
			header: 'Embossing',
			size: 110,
			Cell: ({ row }) => {
				const batches = row.original.batchDetails || [];
				const batchList = batches.map((item) => item.embosingNumber).join(', ') || 'N/A';
				return (
					<Tooltip title={batchList}>
						<span>{batchList}</span>
					</Tooltip>
				);
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
								Failed to load data.
							</Typography>
						</Box>
					) : (
						<DataTable columns={columns} data={data} />
					)}
				</Box>
			</Card>
		</LocalizationProvider>
	);
}

export default RouteSheetSummaryReport;
