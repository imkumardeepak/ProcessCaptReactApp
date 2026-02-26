import React, { useEffect, useState } from 'react';
import {
	Box,
	Grid,
	TextField,
	Button,
	MenuItem,
	Select,
	FormControl,
	InputLabel,
	Typography,
	CircularProgress,
	Alert,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { DownloadingOutlined } from '@mui/icons-material';
import { useApi } from '@/services/machineAPIService';
import * as XLSX from 'xlsx';

function DailyOperationExcel() {
	const { FetchExcel, fetchData } = useApi();
	const [operationDate, setOperationDate] = useState(dayjs());
	const [selectedOperation, setSelectedOperation] = useState('');
	const [selectedMachine, setSelectedMachine] = useState('');
	const [operationCodes, setOperationCodes] = useState([]);
	const [machineCodes, setMachineCodes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [reportLoading, setReportLoading] = useState(false);

	// Fetch operation codes and machine codes
	useEffect(() => {
		const fetchInitialData = async () => {
			setLoading(true);
			try {
				const [operations, machines] = await Promise.all([
					fetchData('excelexport/operationcode'),
					fetchData('excelexport/machinecode'),
				]);
				setOperationCodes(operations);
				setMachineCodes(machines);
			} catch (err) {
				setError(err.message || 'Failed to load initial data');
			} finally {
				setLoading(false);
			}
		};

		fetchInitialData();
	}, []);

	const handleSubmit = async () => {
		const formattedDate = operationDate.format('YYYY-MM-DD');

		setReportLoading(true);
		try {
			const params = new URLSearchParams();

			if (formattedDate) {
				params.append('operationDate', formattedDate);
			}

			if (selectedOperation) {
				params.append('operationCode', selectedOperation);
			}

			if (selectedMachine) {
				params.append('machineCode', selectedMachine);
			}

			const response = await FetchExcel(`ExcelExport/dailyoperationreport?${params.toString()}`);
			console.log('API Response:', response);
			// Create a download link
			const blob = new Blob([response], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			});
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `DailyOperations_${formattedDate}_${selectedOperation || 'All'}_${selectedMachine || 'All'}.xlsx`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (err) {
			setError(err.message || 'Failed to generate report');
			console.error('Error:', err);
		} finally {
			setReportLoading(false);
		}
	};

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Alert severity="error" sx={{ mb: 2 }}>
				{error}
			</Alert>
		);
	}

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h5" gutterBottom>
				Daily Operation Report
			</Typography>

			<Grid container spacing={3}>
				<Grid item xs={12} md={4}>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DatePicker
							label="Operation Date"
							format="DD-MM-YYYY"
							value={operationDate}
							onChange={(newValue) => setOperationDate(newValue)}
							renderInput={(params) => <TextField {...params} fullWidth size="small" />}
						/>
					</LocalizationProvider>
				</Grid>

				<Grid item xs={12} md={4}>
					<FormControl fullWidth size="small">
						<InputLabel>Operation Code</InputLabel>
						<Select
							value={selectedOperation}
							onChange={(e) => setSelectedOperation(e.target.value)}
							label="Operation Code"
						>
							<MenuItem value="">
								<em>All Operations</em>
							</MenuItem>
							{operationCodes.map((code) => (
								<MenuItem key={code} value={code}>
									{code}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>

				<Grid item xs={12} md={4}>
					<FormControl fullWidth size="small">
						<InputLabel>Machine Code</InputLabel>
						<Select
							value={selectedMachine}
							onChange={(e) => setSelectedMachine(e.target.value)}
							label="Machine Code"
						>
							<MenuItem value="">
								<em>All Machines</em>
							</MenuItem>
							{machineCodes.map((code) => (
								<MenuItem key={code} value={code}>
									{code}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>

				<Grid item xs={12}>
					<Button
						variant="contained"
						color="primary"
						onClick={handleSubmit}
						disabled={reportLoading}
						startIcon={reportLoading ? <CircularProgress size={24} /> : <DownloadingOutlined />}
					>
						{reportLoading ? 'Generating Report...' : 'Generate Excel Report'}
					</Button>
				</Grid>
			</Grid>
		</Box>
	);
}

export default DailyOperationExcel;
