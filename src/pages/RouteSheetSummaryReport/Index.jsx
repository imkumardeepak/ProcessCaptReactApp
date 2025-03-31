import DataTable from '@/components/dataTable/Example';
import PageHeader from '@/components/pageHeader';
import { useApi } from '@/services/machineAPIService';
import { Box, Breadcrumbs, Card, Chip, CircularProgress, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

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

	const refetch = async () => {
		setIsLoading(true);
		try {
			const fetchedData = await fetchData(endpoint);
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
	}, [endpoint]);

	const columns = [
		{
			accessorKey: 'planningIssue',
			header: 'Date',
			size: 120,
			Cell: ({ cell }) => {
				const date = cell.getValue();
				return date
					? new Date(date).toLocaleDateString('en-GB', {
							day: '2-digit',
							month: '2-digit',
							year: 'numeric',
						})
					: '-';
			},
			enableSorting: false,
		},
		{
			accessorKey: 'routeSheet',
			header: 'Route Sheet',
			size: 120,
			Cell: ({ cell }) => <Chip label={cell.getValue()} size="small" color="success" />,
			enableSorting: false,
		},
		{
			accessorKey: 'projectCode',
			header: 'Project Code',
			size: 100,
			enableSorting: false,
		},
		{
			accessorKey: 'cutting',
			header: 'Cutting Instruction',
			size: 130,
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
			Cell: ({ cell }) => <Chip label={cell.getValue()} size="small" color="error" />,
			enableSorting: false,
		},
		{
			accessorKey: 'qnty',
			header: 'Qnty',
			size: 100,
			enableSorting: false,
		},
		{
			accessorKey: 'toatlwt',
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
			accessorKey: 'wtperPc',
			header: 'Weight per Piece',
			size: 120,
			enableSorting: false,
		},

		{
			accessorKey: 'batchno',
			header: 'Batch No',
			size: 120,
			enableSorting: false,
		},
		{
			accessorKey: 'embos',
			header: 'Embossing',
			size: 120,
			enableSorting: false,
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
							{name}
						</Typography>
						<Typography variant="body1" color="text.secondary">
							See the {name}.
						</Typography>
					</Stack>
				</Box>
				<Box>
					<DataTable columns={columns} data={data} />
				</Box>
			</Card>
		</>
	);
}

export default RouteSheetSummaryReport;
