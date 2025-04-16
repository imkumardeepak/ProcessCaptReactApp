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
			accessorKey: 'plantcode',
			header: 'Project',
			size: 130,
			orderBy: 'plantcode',
			enableSorting: true,
		},
		{
			accessorKey: 'workOrderNo',
			header: 'Work Order',
			size: 150,
			enableSorting: true,
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
			header: 'Total Wt(Kgs)',
			size: 110,
			enableSorting: false,
		},
		{
			accessorKey: 'checkedRFI',
			header: 'QCF Wt(Kgs)',
			size: 120,
			enableSorting: false,
		},
		{
			accessorKey: 'checkedRFG',
			header: 'RFG Wt(Kgs)',
			size: 120,
			enableSorting: false,
		},
		{
			accessorKey: 'checkedQCG',
			header: 'QCG Wt(Kgs)',
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
			header: 'Pending Wt(Kgs)',
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
