import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/pageHeader';
import { Box, Breadcrumbs, Card, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { useApi } from '@/services/machineAPIService';
import DataTable from '@/components/dataTable/Example';

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
			accessorKey: 'machineNo',
			header: 'Machine Code',
			size: 300,
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
			Cell: ({ cell }) => <Chip label={`${cell.getValue()} Kgs`} size="small" color="success" />,
			enableSorting: true,
			enableGrouping: true,
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

export default MachineLoadReport;
