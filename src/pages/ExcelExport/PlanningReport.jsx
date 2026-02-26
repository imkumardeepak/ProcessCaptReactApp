import { useApi } from '@/services/machineAPIService';
import useData from '@/utils/hooks/useData';
import { DownloadingOutlined } from '@mui/icons-material';
import { Box, Button, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import React, { useEffect, useState } from 'react';

function PlanningReport() {
	const { fetchData, FetchExcel } = useApi();
	const [selectedProject, setSelectedProject] = useState('ALL');
	const [selectedCutting, setSelectedCutting] = useState('ALL');
	const [cuttings, setCuttings] = useState([]);
	const [loading, setLoading] = useState(false);
	const [reportLoading, setReportLoading] = useState(false);

	const {
		data: projectdata = [],
		isLoading: projectLoading,
		error: projectError,
	} = useData('ExcelExport/comboporjectcode', () => fetchData('ExcelExport/comboporjectcode'));

	const projectOptions = ['ALL', ...projectdata];

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

	const handleDownload = async () => {
		setReportLoading(true);
		try {
			const params = new URLSearchParams();
			params.append('projectCode', selectedProject === 'ALL' ? '' : selectedProject);
			params.append('cuttingNo', selectedCutting === 'ALL' ? '' : selectedCutting);
			const response = await FetchExcel(`ExcelExport/planningissue?${params.toString()}`);
			console.log('API Response:', response);
			// Create a download link
			const blob = new Blob([response], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			});
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `PlanningReport_${selectedProject || 'All'}_${selectedCutting || 'All'}.xlsx`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (err) {
			console.error(err);
		} finally {
			setReportLoading(false);
		}
	};

	const isLoading = projectLoading || loading;
	const isError = projectError;

	if (isLoading) {
		return <Box>Loading...</Box>;
	}

	if (isError) {
		return <Box>Error: {projectError}</Box>;
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

export default PlanningReport;
