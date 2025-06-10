import React, { useState, useEffect, useRef } from 'react';
import 'dayjs/locale/es';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	Collapse,
	Box,
	Typography,
	Chip,
	TextField,
	MenuItem,
	Grid,
	FormControl,
	InputLabel,
	Select,
	useTheme,
	useMediaQuery,
	Dialog,
	DialogTitle,
	Divider,
	DialogContent,
	Button,
	TableFooter,
} from '@mui/material';
import { CloseOutlined, Download, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import InspectionReportTemplate from './InspectionReportTemplate';
import { enqueueSnackbar } from 'notistack';
import generatePDF from 'react-to-pdf';
import { useApi } from '@/services/machineAPIService';
import { ImFileExcel } from 'react-icons/im';
import * as XLSX from 'xlsx';

function OperationReportsTable({ data, filters, setFilters }) {
	const { fetchData } = useApi();
	const [openRows, setOpenRows] = useState({});
	const [modalData, setModalData] = useState(null);
	const [open, setOpen] = useState(false);
	const [showTemplate, setShowTemplate] = useState(false);

	const handleCloseModal = () => {
		setOpen(false);
		setModalData(null);
	};

	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

	const fetchDetails = async (routeSheet) => {
		try {
			const response = await fetchData(`ProcessingOrders/routesheet/${routeSheet}?statusflag=1`);
			setModalData(response);
			setOpen(true);
		} catch (err) {
			enqueueSnackbar('Error fetching details:', { variant: 'error' });
			setOpen(false);
		}
	};

	const filteredData = data.filter((row) => {
		const opValid = !filters.operation || row.operation.toLowerCase().includes(filters.operation.toLowerCase());
		return opValid;
	});

	const handleExportExcel = () => {
		const ws = XLSX.utils.json_to_sheet(
			filteredData.map((item) => ({
				Date: dayjs(item.date).format('DD/MM/YYYY'),
				Operation: item.operation,
				'Total Weight (Kgs)': item.totalWT,
				'Route Sheets': item.routeSheetCount,
				Details: (item.details || [])
					.map((d) => `${d.routeSheet} (${d.totalWeight.toFixed(2)} Kgs, Machine: ${d.machineNo || 'N/A'})`)
					.join(', '),
			})),
		);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Operation Reports');
		XLSX.writeFile(wb, `operation-reports_${dayjs().format('YYYY-MM-DD')}.xlsx`);
	};

	const templateRef = useRef();
	const handleGeneratePDF = () => {
		setShowTemplate(true);
		setTimeout(() => {
			generatePDF(templateRef, {
				filename: `inspection-report-${modalData?.routeSheetNo || 'unknown'}.pdf`,
				page: {
					margin: 1,
					format: 'a4',
					orientation: 'landscape',
				},
			}).then(() => {
				setShowTemplate(false);
			});
		}, 100);
	};

	const handleToggle = (key) => {
		setOpenRows((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const handleFilterChange = (field) => (value) => {
		setFilters((prev) => ({ ...prev, [field]: value }));
	};

	const groupedByDate = filteredData.reduce((acc, row) => {
		const dateKey = dayjs(row.date).format('DD/MM/YYYY');
		if (!acc[dateKey]) {
			acc[dateKey] = {
				rows: [],
				totalWT: 0,
				routeSheetCount: 0,
			};
		}
		acc[dateKey].rows.push(row);
		acc[dateKey].totalWT += row.totalWT || 0;
		acc[dateKey].routeSheetCount += row.routeSheetCount || 0;
		return acc;
	}, {});

	const uniqueOperations = [...new Set(data.map((item) => item.operation))];
	const uniqueMachineNos = [
		...new Set(data.flatMap((item) => (item.details || []).map((d) => d.machineNo).filter(Boolean))),
	];

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<Paper>
				<Box p={2}>
					<Grid container spacing={2} alignItems="center">
						<Grid item xs={12} sm={2}>
							<Button
								variant="text"
								color="primary"
								fullWidth
								onClick={handleExportExcel}
								startIcon={<ImFileExcel />}
							>
								Export Excel
							</Button>
						</Grid>
						<Grid item xs={12} sm={3}>
							<DatePicker
								label="From Date"
								value={filters.fromDate}
								onChange={handleFilterChange('fromDate')}
								renderInput={(params) => <TextField {...params} fullWidth />}
							/>
						</Grid>
						<Grid item xs={12} sm={3}>
							<DatePicker
								label="To Date"
								value={filters.toDate}
								onChange={handleFilterChange('toDate')}
								renderInput={(params) => <TextField {...params} fullWidth />}
								minDate={filters.fromDate}
							/>
						</Grid>
						<Grid item xs={12} sm={2}>
							<FormControl fullWidth>
								<InputLabel>Machine No</InputLabel>
								<Select
									value={filters.machineNo}
									label="Machine No"
									onChange={(e) => handleFilterChange('machineNo')(e.target.value)}
								>
									<MenuItem value="">All Machines</MenuItem>
									{uniqueMachineNos.map((machineNo) => (
										<MenuItem key={machineNo} value={machineNo}>
											{machineNo}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12} sm={2}>
							<FormControl fullWidth>
								<InputLabel>Operation</InputLabel>
								<Select
									value={filters.operation}
									label="Operation"
									onChange={(e) => handleFilterChange('operation')(e.target.value)}
								>
									<MenuItem value="">All Operations</MenuItem>
									{uniqueOperations.map((op) => (
										<MenuItem key={op} value={op}>
											{op}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
					</Grid>
				</Box>

				<TableContainer>
					<Table size="small">
						<TableHead>
							<TableRow>
								<TableCell />
								<TableCell>Date</TableCell>
								<TableCell>Operation</TableCell>
								<TableCell>Total Weight</TableCell>
								<TableCell>Route Sheets</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{Object.entries(groupedByDate).map(([date, group], groupIdx) => (
								<React.Fragment key={date}>
									<TableRow sx={{ backgroundColor: '#f5f5f5' }}>
										<TableCell colSpan={3}>
											<strong>{date}</strong>
										</TableCell>
										<TableCell>
											<Chip
												label={`Total: ${group.totalWT.toFixed(2)} Kgs`}
												size="small"
												color="success"
											/>
										</TableCell>
										<TableCell>
											<Chip
												label={`Sheets: ${group.routeSheetCount}`}
												size="small"
												color="success"
											/>
										</TableCell>
									</TableRow>

									{group.rows.map((row, idx) => (
										<React.Fragment key={`${date}-${idx}`}>
											<TableRow>
												<TableCell>
													<IconButton
														size="small"
														onClick={() => handleToggle(`${date}-${idx}`)}
													>
														{openRows[`${date}-${idx}`] ? (
															<KeyboardArrowUp />
														) : (
															<KeyboardArrowDown />
														)}
													</IconButton>
												</TableCell>
												<TableCell>{dayjs(row.date).format('DD/MM/YYYY')}</TableCell>
												<TableCell>{row.operation}</TableCell>
												<TableCell>
													<Chip
														label={`${row.totalWT.toFixed(2)} Kgs`}
														size="small"
														color="secondary"
													/>
												</TableCell>
												<TableCell>{row.routeSheetCount}</TableCell>
											</TableRow>

											<TableRow>
												<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
													<Collapse
														in={openRows[`${date}-${idx}`]}
														timeout="auto"
														unmountOnExit
													>
														<Box margin={0}>
															<Table size="small">
																<TableHead>
																	<TableRow>
																		<TableCell>Route Sheet</TableCell>
																		<TableCell>Release Date</TableCell>
																		<TableCell>Cutting No</TableCell>
																		<TableCell>Weight</TableCell>
																		<TableCell>Quantity</TableCell>
																		<TableCell>Machine No</TableCell>
																	</TableRow>
																</TableHead>
																<TableBody>
																	{(row.details || []).map((detail, dIdx) => (
																		<TableRow key={dIdx}>
																			<TableCell>
																				<Button
																					onClick={() =>
																						fetchDetails(detail.routeSheet)
																					}
																					variant="text"
																					color="primary"
																					size="small"
																				>
																					{detail.routeSheet}
																				</Button>
																			</TableCell>
																			<TableCell>
																				{dayjs(detail.releaseDate).format(
																					'DD/MM/YYYY HH:mm',
																				)}
																			</TableCell>
																			<TableCell>{detail.cuttingNo}</TableCell>
																			<TableCell>
																				<Chip
																					label={`${detail.totalWeight.toFixed(2)} Kgs`}
																					size="small"
																					color="primary"
																				/>
																			</TableCell>
																			<TableCell>{detail.totalQunty}</TableCell>
																			<TableCell>
																				{detail.machineNo || 'N/A'}
																			</TableCell>
																		</TableRow>
																	))}
																</TableBody>
															</Table>
														</Box>
													</Collapse>
												</TableCell>
											</TableRow>
										</React.Fragment>
									))}
								</React.Fragment>
							))}
						</TableBody>

						<TableFooter>
							<TableRow>
								<TableCell colSpan={3} align="right">
									<Typography variant="h5">Overall Grand Totals:</Typography>
								</TableCell>
								<TableCell>
									<Chip
										label={`${filteredData
											.reduce((sum, row) => sum + (row.totalWT || 0), 0)
											.toFixed(2)} Kgs`}
										size="medium"
										color="primary"
									/>
								</TableCell>
								<TableCell>
									<Chip
										label={filteredData.reduce((sum, row) => sum + (row.routeSheetCount || 0), 0)}
										size="medium"
										color="primary"
									/>
								</TableCell>
							</TableRow>
						</TableFooter>
					</Table>
				</TableContainer>
			</Paper>

			<Dialog open={open} onClose={handleCloseModal} maxWidth="lg" fullScreen={fullScreen} fullWidth>
				<DialogTitle variant="h4" bgcolor={'primary.paper'}>
					INPROCESS INSPECTION REPORT OF {modalData ? modalData?.routeSheetNo : ''}
					<IconButton
						aria-label="close"
						onClick={handleCloseModal}
						sx={{ position: 'absolute', right: 8, top: 8 }}
					>
						<CloseOutlined />
					</IconButton>
					<IconButton
						aria-label="download"
						onClick={handleGeneratePDF}
						sx={{ position: 'absolute', right: 40, top: 10 }}
					>
						<Download />
					</IconButton>
				</DialogTitle>
				<Divider />
				<DialogContent sx={{ p: 0 }}>
					{modalData ? (
						<Grid container spacing={2}>
							{modalData.details && modalData.details.length > 0 ? (
								<Grid item xs={12} sm={12} md={12} mt={0}>
									<Box display="flex" justifyContent="center" sx={{ width: '100%' }}>
										<TableContainer sx={{ maxWidth: '100%', maxHeight: 'calc(100vh - 150px)' }}>
											<Table stickyHeader size="small">
												<TableHead>
													<TableRow>
														<TableCell justifyContent="center" align="center">
															<strong>Line No</strong>
														</TableCell>
														<TableCell justifyContent="center" align="center">
															<strong>Job Description</strong>
														</TableCell>
														<TableCell justifyContent="center" align="center">
															<strong>Machine Number</strong>
														</TableCell>
														<TableCell justifyContent="center" align="center">
															<strong>Date</strong>
														</TableCell>
														<TableCell justifyContent="center" align="center">
															<strong>Shift</strong>
														</TableCell>
														<TableCell justifyContent="center" align="center">
															<strong>Total Qnty</strong>
														</TableCell>
														<TableCell justifyContent="center" align="center">
															<strong>Qnty At Check</strong>
														</TableCell>
														<TableCell justifyContent="center" align="center">
															<strong>Checked By</strong>
														</TableCell>
													</TableRow>
												</TableHead>
												<TableBody>
													{modalData.details
														.filter((detail) => detail.isCompleted === 1)
														.sort(
															(a, b) =>
																new Date(a.checkDateTime) - new Date(b.checkDateTime),
														)
														.map((detail, index) => (
															<TableRow key={index}>
																<TableCell justifyContent="center" align="center">
																	{detail.operation_Number}
																</TableCell>
																<TableCell justifyContent="center" align="center">
																	{detail.operation_Description}
																</TableCell>
																<TableCell justifyContent="center" align="center">
																	{detail.machineNo || 'N/A'}
																</TableCell>
																<TableCell>
																	<Box
																		display="flex"
																		flexDirection="column"
																		alignItems="center"
																	>
																		<Typography
																			variant="body1"
																			sx={{ fontSize: '0.9rem' }}
																		>
																			{dayjs(detail.checkDateTime).format(
																				'DD-MM-YYYY',
																			)}
																		</Typography>
																		<Typography
																			variant="body2"
																			sx={{ fontSize: '0.8rem' }}
																		>
																			{dayjs(detail.checkDateTime).format(
																				'HH:mm:ss',
																			)}
																		</Typography>
																	</Box>
																</TableCell>
																<TableCell justifyContent="center" align="center">
																	{detail.shift}
																</TableCell>
																<TableCell justifyContent="center" align="center">
																	{modalData.totalQunty}
																</TableCell>
																<TableCell justifyContent="center" align="center">
																	{detail.checkQnty}
																</TableCell>
																<TableCell justifyContent="center" align="center">
																	{detail.operator}
																</TableCell>
															</TableRow>
														))}
												</TableBody>
											</Table>
										</TableContainer>
									</Box>
								</Grid>
							) : (
								<Typography variant="body2">No production details available.</Typography>
							)}
						</Grid>
					) : (
						<Typography variant="body2">No data available.</Typography>
					)}
				</DialogContent>
			</Dialog>

			<Box
				ref={templateRef}
				sx={{
					position: 'absolute',
					left: '-9999px',
					width: '300mm',
					backgroundColor: 'white',
					visibility: showTemplate ? 'visible' : 'hidden',
				}}
			>
				<InspectionReportTemplate data={modalData} />
			</Box>
		</LocalizationProvider>
	);
}

export default OperationReportsTable;
