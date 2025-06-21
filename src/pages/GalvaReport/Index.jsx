import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DataTable from '@/components/dataTable/Example';
import PageHeader from '@/components/pageHeader';
import { useApi } from '@/services/machineAPIService';
import { Box, Breadcrumbs, Card, Chip, CircularProgress, Stack, Tooltip, Typography, Pagination } from '@mui/material';

function GalvaReport() {
	return (
		<>
			<PageHeader title="Galva Report">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Reports</Typography>
					<Typography color="text.secondary">Galva Report</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<DataTableSection name="Galva Report" endpoint="Report/galvaReport" />
			</Box>
		</>
	);
}

function DataTableSection({ name, endpoint }) {
	const { fetchData } = useApi();

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['galvaReport'], // Unique key for caching
		queryFn: () => fetchData(endpoint), // Fetch with pagination params
		keepPreviousData: true, // Keep previous data while fetching new page
		staleTime: 5 * 60 * 1000, // Cache for 10 minutes
	});

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
			accessorKey: 'projectCode',
			header: 'Project Code',
			size: 80,
			enableSorting: false,
		},
		{
			accessorKey: 'wororderNo',
			header: 'Work Order no',
			size: 150,
			enableSorting: false,
		},
		{
			accessorKey: 'cutting',
			header: 'Cutting Instruction',
			size: 100,
			enableSorting: true,
		},
		{
			accessorKey: 'routeSheet',
			header: 'Route Sheet',
			size: 150,
			Cell: ({ cell }) => <Chip label={cell.getValue()} size="small" color="success" />,
			enableSorting: false,
		},
		{
			accessorKey: 'markNo',
			header: 'Markno',
			size: 120,
			enableSorting: true,
		},
		{
			accessorKey: 'section',
			header: 'Section',
			size: 180,
			enableSorting: true,
		},
		{
			accessorKey: 'operation',
			header: 'Pending Operations',
			size: 250,
			Cell: ({ cell }) => <Chip label={cell.getValue().toUpperCase()} size="small" color="error" />,
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
			accessorKey: 'batch',
			header: 'Batch',
			size: 110,
			Cell: ({ row }) => {
				const batches = row.original.batchDetails || [];
				const batchList = batches.map((item) => item.batchNo).join(', ');
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
				const batchList = batches.map((item) => item.ciP_Number).join(', ');
				return (
					<Tooltip title={batchList}>
						<span>{batchList}</span>
					</Tooltip>
				);
			},
		},
		{
			accessorKey: 'embosing',
			header: 'Embosing',
			size: 110,
			Cell: ({ row }) => {
				const batches = row.original.batchDetails || [];
				const batchList = batches.map((item) => item.embosingNumber).join(', ');
				return (
					<Tooltip title={batchList}>
						<span>{batchList}</span>
					</Tooltip>
				);
			},
		},
	];

	// Render Loading State
	if (isLoading && !data) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" height="200px">
				<CircularProgress />
			</Box>
		);
	}

	// Render Error State
	if (error) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" height="200px">
				<Typography variant="h6" color="error">
					Failed to load data: {error.message}
				</Typography>
			</Box>
		);
	}

	return (
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
				<DataTable columns={columns} data={data || []} />
			</Box>
		</Card>
	);
}

export default GalvaReport;
