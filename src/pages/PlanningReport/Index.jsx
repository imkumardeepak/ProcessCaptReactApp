import DataTable from '@/components/dataTable/Example';
import PageHeader from '@/components/pageHeader';
import { useApi } from '@/services/machineAPIService';
import {
	Box,
	Breadcrumbs,
	Card,
	Chip,
	CircularProgress,
	MenuItem,
	Select,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

function PlanningReport() {
	return (
		<>
			<PageHeader title="Planning Wise Report">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Reports</Typography>
					<Typography color="text.secondary">Planning Wise Report</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<DataTableSection name="Planning Wise Report" endpoint="Report/Planningwisereport" />
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
			size: 80,
		},
		{
			accessorKey: 'cuttingInstruction',
			header: 'Cutting Instruction',
			size: 90,
			enableGrouping: false,
		},
		{
			accessorKey: 'workOrderNo',
			header: 'Work Order',
			size: 120,
			enableGrouping: false,
		},
		{
			accessorKey: 'sectionDesc',
			header: 'Section Description',
			size: 180,
			enableSorting: false,
		},
		{
			accessorKey: 'planningReleaseSheet',
			header: 'PR Qnty',
			size: 110,
			Cell: ({ cell }) => <Chip label={cell.getValue()} size="small" color="success" />,
			enableSorting: false,
			enableGrouping: false,
		},
		{
			accessorKey: 'planningTotalWT',
			header: 'WT(Kgs)',
			size: 100,
			Cell: ({ cell }) => {
				const value = cell.getValue(); // e.g., 200000
				const formattedValue = new Intl.NumberFormat('en-IN').format(value); // Formats to "2,00,000"
				return <Chip label={formattedValue} size="small" color="success" />;
			},
			enableSorting: false,
			enableGrouping: false,
		},
		{
			accessorKey: 'floorReleaseRouteSheet',
			header: 'SPR Qnty',
			size: 100,
			Cell: ({ cell }) => <Chip label={cell.getValue()} size="small" color="primary" />,
			enableSorting: false,
			enableGrouping: false,
		},
		{
			accessorKey: 'floorReleaseWT',
			header: 'WT(Kgs)',
			size: 100,
			Cell: ({ cell }) => {
				const value = cell.getValue(); // e.g., 200000
				const formattedValue = new Intl.NumberFormat('en-IN').format(value); // Formats to "2,00,000"
				return <Chip label={formattedValue} size="small" color="primary" />;
			},
			enableSorting: false,
			enableGrouping: false,
		},
		{
			accessorKey: 'pendingRelease',
			header: 'Pending SPR',
			size: 110,
			Cell: ({ cell }) => <Chip label={cell.getValue()} size="small" color="error" />,
			enableSorting: false,
			enableGrouping: false,
		},
		{
			accessorKey: 'pendingReleaseWT',
			header: 'WT(Kgs)',
			size: 100,
			Cell: ({ cell }) => {
				const value = cell.getValue(); // e.g., 200000
				const formattedValue = new Intl.NumberFormat('en-IN').format(value); // Formats to "2,00,000"
				return <Chip label={formattedValue} size="small" color="error" />;
			},
			enableSorting: false,
			enableGrouping: false,
		},
		{
			accessorKey: 'machines',
			header: 'Machine',
			size: 110,
			enableSorting: false,
		},
		// {
		// 	accessorKey: 'status',
		// 	header: 'Status',
		// 	size: 100,
		// 	Cell: ({ row }) => {
		// 		const status = row.original.status;
		// 		if (status === 0) {
		// 			return (
		// 				<Tooltip title="Released">
		// 					<Chip label="Released" color="success" size="small" />
		// 				</Tooltip>
		// 			);
		// 		}
		// 		return (
		// 			<Tooltip title="Pending">
		// 				<Chip label="Pending" color="warning" size="small" />
		// 			</Tooltip>
		// 		);
		// 	},
		// 	Filter: ({ column }) => {
		// 		const [selectedStatus, setSelectedStatus] = React.useState('');

		// 		return (
		// 			<Select
		// 				value={selectedStatus}
		// 				onChange={(e) => {
		// 					const value = e.target.value;
		// 					setSelectedStatus(value);
		// 					column.setFilterValue(value === '' ? null : value); // Set filter to null for "All"
		// 				}}
		// 				displayEmpty
		// 				size="small"
		// 				sx={{ minWidth: 120 }}
		// 			>
		// 				<MenuItem value="">All</MenuItem>
		// 				<MenuItem value="0">Released</MenuItem>
		// 				<MenuItem value="pending">Pending</MenuItem>
		// 			</Select>
		// 		);
		// 	},
		// 	filterFn: (row, columnId, filterValue) => {
		// 		if (!filterValue) return true; // No filter applied
		// 		const status = row.getValue(columnId);
		// 		if (filterValue === '0') return status === 0; // "Released"
		// 		return status !== 0; // "Pending" (covers null or any non-zero value)
		// 	},
		// 	enableGrouping: false,
		// },
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

export default PlanningReport;
