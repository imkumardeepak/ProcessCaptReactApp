import PageHeader from '@/components/pageHeader';
import { AppBar, Box, Breadcrumbs, Card, Stack, Tab, Tabs, Typography, useTheme } from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';
import StatusReportExcel from './StatusReportExcel';
import DailyOperationExcel from './DailyOperationExcel';
import PlanningReport from './PlanningReport';
import ProjectSummary from './ProjectSummary';
import CycleReport from './CycleReport';
function ExcelExport() {
	const theme = useTheme();
	const [value, setValue] = React.useState(0);

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	return (
		<>
			<PageHeader title="Excel Export Report">
				<Breadcrumbs aria-label="breadcrumb" sx={{ textTransform: 'uppercase' }}>
					<Typography color="text.secondary">Reports</Typography>
					<Typography color="text.secondary">Excel Export Report</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Box mt={3}>
				<Card>
					<Box sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
						<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
							<Stack>
								<Typography variant="h5" fontWeight="500" textTransform="uppercase">
									Excel Export Report
								</Typography>
								<Typography variant="body1" color="text.secondary">
									Here you can export to Excel.
								</Typography>
							</Stack>
						</Stack>
						<Box sx={{ width: '100%' }}>
							<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
								<Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
									<Tab label="Status Report" {...a11yProps(0)} />
									<Tab label="Daily Operation" {...a11yProps(1)} />
									<Tab label="Planning Issue Report" {...a11yProps(2)} />
									<Tab label="Completion Report" {...a11yProps(3)} />
								</Tabs>
							</Box>
							<CustomTabPanel value={value} index={0}>
								<StatusReportExcel />
							</CustomTabPanel>
							<CustomTabPanel value={value} index={1}>
								<DailyOperationExcel />
							</CustomTabPanel>
							<CustomTabPanel value={value} index={2}>
								<PlanningReport />
							</CustomTabPanel>

							<CustomTabPanel value={value} index={3}>
								<CycleReport />
							</CustomTabPanel>
						</Box>
					</Box>
				</Card>
			</Box>
		</>
	);
}

export default ExcelExport;

function CustomTabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ p: 3 }}>{children}</Box>}
		</div>
	);
}

CustomTabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.number.isRequired,
	value: PropTypes.number.isRequired,
};

function a11yProps(index) {
	return {
		id: `simple-tab-${index}`,
		'aria-controls': `simple-tabpanel-${index}`,
	};
}
