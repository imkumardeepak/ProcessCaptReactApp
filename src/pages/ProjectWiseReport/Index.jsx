import DataTable from '@/components/dataTable/Example';
import PageHeader from '@/components/pageHeader';
import { useApi } from '@/services/machineAPIService';
import { Box, Breadcrumbs, Card, Chip, CircularProgress, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

function ProjectWiseReport() {
	return (
		<>
			<PageHeader title="Project Wise Report">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Reports</Typography>
					<Typography color="text.secondary">Project Wise Report</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<DataTableSection name="Project Wise Report" endpoint="Report/summaryreport" />
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
			accessorKey: 'date',
			header: 'Date',
			size: 100,
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
			Filter: ({ column }) => {
				const [selectedDate, setSelectedDate] = useState(null);

				return (
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DatePicker
							label="Select Date"
							value={selectedDate}
							onChange={(newValue) => {
								setSelectedDate(newValue);
								column.setFilterValue(newValue ? dayjs(newValue).format('YYYY-MM-DD') : null);
							}}
							renderInput={(params) => <TextField {...params} size="small" variant="outlined" />}
						/>
					</LocalizationProvider>
				);
			},
			filterFn: (row, columnId, filterValue) => {
				const rowDate = dayjs(row.getValue(columnId)).format('YYYY-MM-DD');
				return rowDate === filterValue;
			},
		},
		{
			accessorKey: 'plantcode',
			header: 'Project',
			size: 110,
			orderBy: 'plantcode',
		},

		{
			accessorKey: 'totalQnty',
			header: 'Sheet Qnty',
			size: 150,
			Cell: ({ cell }) => <Chip label={cell.getValue()} size="small" color="success" />,
			enableSorting: false,
		},
		{
			accessorKey: 'totalWeight',
			header: 'Weight',
			size: 110,
			enableSorting: false,
		},
		{
			accessorKey: 'checkedRFI',
			header: 'QCF Qty',
			size: 120,
			enableSorting: false,
		},
		{
			accessorKey: 'checkedRFG',
			header: 'RFG Qty',
			size: 120,
			enableSorting: false,
		},
		{
			accessorKey: 'checkedQCG',
			header: 'QCG Qty',
			size: 120,
			enableSorting: false,
		},
		{
			accessorKey: 'checkedRFD',
			header: 'RFD Qty',
			size: 120,
			enableSorting: false,
		},
		{
			accessorKey: 'status',
			header: 'Pending Qty',
			size: 120,
			Cell: ({ row }) => {
				const status = row.original.status;
				if (status === 0) {
					return <Chip label={status} color="success" size="small" />;
				}
				if (status === null) {
					return <Chip label={row.original.totalQnty} color="error" size="small" />;
				}
				return <Chip label={status} color="error" size="small" />;
			},
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

export default ProjectWiseReport;
