import DataTable from '@/components/dataTable/Example';
import PageHeader from '@/components/pageHeader';
import { useApi } from '@/services/machineAPIService';
import { Box, Breadcrumbs, Card, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

function CycleTimeReports() {
	return (
		<>
			<PageHeader title="Cycle Time Reports">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Reports</Typography>
					<Typography color="text.secondary">Cycle Time Reports</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<DataTableSection name="Cycle Time Report" endpoint="Report/cyclereport" />
			</Box>
		</>
	);
}

function DataTableSection({ endpoint }) {
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
			accessorKey: 'routeSheet',
			header: 'RouteSheet',
			size: 100,
			Cell: ({ cell }) => <Chip label={cell.getValue()} size="small" color="primary" />,
			enableSorting: false,
		},
		{
			accessorKey: 'planningReleaseDate',
			header: 'PR Date',
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
			accessorKey: 'shopfloor',
			header: 'SFR Date',
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
			accessorKey: 'rfiDate',
			header: 'QCF Date',
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
			enableGrouping: false,
		},
		{
			accessorKey: 'rfiTime',
			header: 'Cycle Time',
			size: 100,
			Cell: ({ cell }) => {
				const totalMinutes = cell.getValue();
				if (!totalMinutes) return '-';
				const days = Math.floor(totalMinutes / (60 * 24));
				const remainingMinutesAfterDays = totalMinutes % (60 * 24);
				const hours = Math.floor(remainingMinutesAfterDays / 60);
				const minutes = Math.round(remainingMinutesAfterDays % 60);
				return `${days}d ${hours}h ${minutes}m`;
			},
			enableSorting: false,
			enableColumnFilter: false,
			enableGrouping: false,
		},
		{
			accessorKey: 'rfgDate',
			header: 'RFG Date',
			size: 110,
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
			enableGrouping: false,
		},
		{
			accessorKey: 'rfgTime',
			header: 'Cycle Time',
			size: 110,
			Cell: ({ cell }) => {
				const totalMinutes = cell.getValue();
				if (!totalMinutes) return '-';
				const days = Math.floor(totalMinutes / (60 * 24));
				const remainingMinutesAfterDays = totalMinutes % (60 * 24);
				const hours = Math.floor(remainingMinutesAfterDays / 60);
				const minutes = Math.round(remainingMinutesAfterDays % 60);
				return `${days}d ${hours}h ${minutes}m`;
			},
			enableSorting: false,
			enableGrouping: false,
		},
		{
			accessorKey: 'qcgDate',
			header: 'QCG Date',
			size: 110,
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
			enableGrouping: false,
		},
		{
			accessorKey: 'qcgTime',
			header: 'Cycle Time',
			size: 100,
			Cell: ({ cell }) => {
				const totalMinutes = cell.getValue();
				if (!totalMinutes) return '-';
				const days = Math.floor(totalMinutes / (60 * 24));
				const remainingMinutesAfterDays = totalMinutes % (60 * 24);
				const hours = Math.floor(remainingMinutesAfterDays / 60);
				const minutes = Math.round(remainingMinutesAfterDays % 60);
				return `${days}d ${hours}h ${minutes}m`;
			},
			enableSorting: false,
			enableGrouping: false,
		},
		{
			accessorKey: 'rfdDate',
			header: 'RFD Date',
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
			enableGrouping: false,
		},
		{
			accessorKey: 'rfdTime',
			header: 'Cycle Time',
			size: 100,
			Cell: ({ cell }) => {
				const totalMinutes = cell.getValue();
				if (!totalMinutes) return '-';
				const days = Math.floor(totalMinutes / (60 * 24));
				const remainingMinutesAfterDays = totalMinutes % (60 * 24);
				const hours = Math.floor(remainingMinutesAfterDays / 60);
				const minutes = Math.round(remainingMinutesAfterDays % 60);
				return `${days}d ${hours}h ${minutes}m`;
			},
			enableSorting: false,
			enableGrouping: false,
		},
		{
			accessorKey: 'totalTime',
			header: 'TAT',
			size: 120,
			Cell: ({ cell }) => {
				const totalMinutes = cell.getValue();
				if (!totalMinutes) return '-';
				const days = Math.floor(totalMinutes / (60 * 24));
				const remainingMinutesAfterDays = totalMinutes % (60 * 24);
				const hours = Math.floor(remainingMinutesAfterDays / 60);
				const minutes = Math.round(remainingMinutesAfterDays % 60);
				return <Chip label={`${days}d ${hours}h ${minutes}m`} size="small" color="success" />;
			},
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
							Cycle Time Reports
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
		</>
	);
}

export default CycleTimeReports;
