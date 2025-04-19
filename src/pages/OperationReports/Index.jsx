import React, { useEffect, useState } from 'react';
import {
	Breadcrumbs,
	Typography,
	Box,
	CircularProgress,
	Card,
	Stack, // Import TableContainer
} from '@mui/material';
import PageHeader from '@/components/pageHeader';

import { useApi } from '@/services/machineAPIService';
import OperationReportsTable from './OperationReportsTable';

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
							Daily Operation Report
						</Typography>
						<Typography variant="body1" color="text.secondary">
							See the daily operation report below.
						</Typography>
					</Stack>
				</Box>
				<Box>
					<OperationReportsTable data={data} />
				</Box>
			</Card>
		</>
	);
}

export default OperationReports;
