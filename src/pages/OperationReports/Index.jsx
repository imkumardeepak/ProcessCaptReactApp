import React, { useEffect, useState } from 'react';
import { Breadcrumbs, Typography, Box, CircularProgress, Card, Stack } from '@mui/material';
import PageHeader from '@/components/pageHeader';
import { useApi } from '@/services/machineAPIService';
import OperationReportsTable from './OperationReportsTable';
import dayjs from 'dayjs';

function OperationReports() {
	return (
		<>
			<PageHeader title="Daily Operation Reports">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Reports</Typography>
					<Typography color="text.secondary">Daily Operation Reports</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<DataTableSection name="Daily Operation Report" endpoint="Report/GetOperationWiseLoadSummary" />
			</Box>
		</>
	);
}

function DataTableSection({ endpoint, name }) {
	const { fetchData } = useApi();
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [filters, setFilters] = useState({
		fromDate: dayjs(),
		toDate: dayjs(),
		machineNo: '',
		operation: '',
	});

	const refetch = async () => {
		setIsLoading(true);
		try {
			const fromDate = filters.fromDate.format('YYYY-MM-DD');
			const toDate = filters.toDate.format('YYYY-MM-DD');
			const queryParams = new URLSearchParams({
				fromDate,
				toDate,
				...(filters.machineNo && { MachineNo: filters.machineNo }),
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
	}, [filters.fromDate, filters.toDate, filters.machineNo, endpoint]);

	return (
		<>
			<Card>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						p: 2,
					}}
				>
					<Stack>
						<Typography variant="h4" fontWeight="500" textTransform="uppercase">
							{name}
						</Typography>
						<Typography variant="body1" color="text.secondary">
							See the daily operation report below.
						</Typography>
					</Stack>
				</Box>
				<Box>
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
						<OperationReportsTable data={data} filters={filters} setFilters={setFilters} />
					)}
				</Box>
			</Card>
		</>
	);
}

export default OperationReports;
