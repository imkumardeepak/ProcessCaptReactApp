import { useApi } from '@/services/machineAPIService';
import useData from '@/utils/hooks/useData';
import { DownloadingOutlined } from '@mui/icons-material';
import {
	Box,
	Grid,
	TextField,
	CircularProgress,
	Alert,
	Button,
	MenuItem,
	Select,
	FormControl,
	InputLabel,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

function StatusReportExcel() {
	const { fetchData, FetchExcel } = useApi();
	const [cuttings, setCuttings] = useState([]);
	const [routes, setRoutes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [reportData, setReportData] = useState([]);
	const [reportLoading, setReportLoading] = useState(false);
	const [selectedProject, setSelectedProject] = useState('ALL');
	const [selectedCutting, setSelectedCutting] = useState('ALL');
	const [selectedRoute, setSelectedRoute] = useState('ALL');

	// Fetch project data
	const {
		data: projectdata = [],
		isLoading: projectLoading,
		error: projectError,
	} = useData('ExcelExport/comboporjectcode', () => fetchData('ExcelExport/comboporjectcode'));

	// Add "ALL" option to projects
	const projectOptions = ['ALL', ...projectdata];

	// Fetch cutting data when project changes
	useEffect(() => {
		if (selectedProject === 'ALL') {
			setCuttings([]);
			setSelectedCutting('ALL');
			return;
		}

		setLoading(true);
		fetchData(`ExcelExport/combocuttingno?projectCode=${selectedProject}`)
			.then((data) => {
				setCuttings(['ALL', ...data.map((d) => d.toString())]);
				setSelectedCutting('ALL');
			})
			.finally(() => setLoading(false));
	}, [selectedProject]);

	// Fetch route data when cutting changes
	useEffect(() => {
		if (selectedCutting === 'ALL') {
			setRoutes([]);
			setSelectedRoute('ALL');
			return;
		}

		setLoading(true);
		fetchData(`ExcelExport/comboroutesheetno?cuttingNo=${selectedCutting}`)
			.then((data) => {
				setRoutes(['ALL', ...data]);
				setSelectedRoute('ALL');
			})
			.finally(() => setLoading(false));
	}, [selectedCutting]);

	const handleDownload = async () => {
		setReportLoading(true);
		try {
			const params = new URLSearchParams();

			if (selectedProject && selectedProject !== 'ALL') {
				params.append('projectCode', selectedProject);
			}

			if (selectedCutting && selectedCutting !== 'ALL') {
				params.append('cuttingNo', selectedCutting);
			}

			if (selectedRoute && selectedRoute !== 'ALL') {
				params.append('routeSheetNo', selectedRoute);
			}

			// Fetch the data
			const response = await FetchExcel(`ExcelExport/statusreport?${params.toString()}`);
			console.log('API Response:', response);
			const blob = new Blob([response], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			});
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `StatusReport_${selectedProject || 'All'}_${selectedCutting || 'All'}.xlsx`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Download failed:', error);
			// Optionally show error to user
			alert('Failed to generate Excel file');
		} finally {
			setReportLoading(false);
		}
	};

	if (projectLoading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
				<CircularProgress />
			</Box>
		);
	}

	if (projectError) {
		return (
			<Alert severity="error" sx={{ mb: 2 }}>
				Error loading data: {projectError.message}
			</Alert>
		);
	}

	return (
		<Box>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={4} md={4}>
					<FormControl fullWidth size="small">
						<InputLabel>Project</InputLabel>
						<Select
							value={selectedProject}
							onChange={(e) => setSelectedProject(e.target.value)}
							label="Project"
						>
							{projectOptions.map((project) => (
								<MenuItem key={project} value={project}>
									{project}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>

				<Grid item xs={12} sm={4} md={4}>
					<FormControl fullWidth size="small" disabled={selectedProject === 'ALL'}>
						<InputLabel>Cutting No</InputLabel>
						<Select
							value={selectedCutting}
							onChange={(e) => setSelectedCutting(e.target.value)}
							label="Cutting No"
						>
							{cuttings.map((cutting) => (
								<MenuItem key={cutting} value={cutting}>
									{cutting}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>

				<Grid item xs={12} sm={4} md={4}>
					<FormControl fullWidth size="small" disabled={selectedCutting === 'ALL'}>
						<InputLabel>Route Sheet No</InputLabel>
						<Select
							value={selectedRoute}
							onChange={(e) => setSelectedRoute(e.target.value)}
							label="Route Sheet No"
						>
							{routes.map((route) => (
								<MenuItem key={route} value={route}>
									{route}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Grid>

				<Grid item xs={12}>
					<Button
						variant="contained"
						color="primary"
						onClick={handleDownload}
						startIcon={reportLoading ? <CircularProgress size={20} /> : <DownloadingOutlined />}
						disabled={reportLoading}
					>
						{reportLoading ? 'Generating Report...' : 'Download Excel'}
					</Button>
				</Grid>
			</Grid>
		</Box>
	);
}

export default StatusReportExcel;
