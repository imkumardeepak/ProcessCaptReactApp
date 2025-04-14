// InspectionReportTemplate.jsx
import React from 'react';
import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, Chip } from '@mui/material';
import dayjs from 'dayjs';

const InspectionReportTemplate = ({ data }) => {
	if (!data) return null;

	return (
		<Box sx={{ p: 1, backgroundColor: '#fff', width: '100%' }}>
			{/* Header */}
			<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
				<Box>
					<Typography variant="h6">TRANSRAIL LIGHTING LTD</Typography>
				</Box>
				<Box sx={{ textAlign: 'center', flexGrow: 1 }}>
					<Typography variant="h6" sx={{ fontWeight: 'bold' }}>
						PRODUCTION AND INPROCESS INSPECTION REPORT
					</Typography>
				</Box>
			</Box>

			{/* Top Table */}
			<Box sx={{ border: '0.1px solid black', width: '100%' }}>
				<Table size="small">
					<TableBody>
						<TableRow>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
								WORK ORDER NO
							</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
								{data.workOrderNo || '--'}
							</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>Section</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>Length(mm)</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>Wt/Pcs(Kg)</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>Qty/Tower</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }} colSpan={2}>
								FORMAT NO: F/PROD/011
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>Mark No</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
								{data.markNo || '--'}
							</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }} />
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }} />
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }} />
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }} />
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>Total Qty</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
								Total Wt(Kg)
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
								Route Sheet No.
							</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
								<Typography variant="body1" sx={{ fontWeight: 'bold' }}>
									{data.routeSheetNo || '--'}
								</Typography>
							</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
								Type Of Tower
							</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>Project</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>Description</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>Batch Qty</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
								Planning Memo Number
							</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>QRS No.</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</Box>

			{/* IN-PROCESS INSPECTION Section */}
			{/* <Box sx={{ mt: 2, border: '0.1px solid black', p: 1, width: '100%' }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
					IN-PROCESS INSPECTION :{' '}
					{data.inspectionNotes ||
						'General Path Tolerances: For R/M Cut Lengths: +/- 2mm; Camber: To be Straightened reasonably...'}
				</Typography>
			</Box> */}

			{/* Main Inspection Table */}
			<Box sx={{ mt: 1, border: '0.1px solid black', width: '100%' }}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>Line No</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
								Job Description
							</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
								Machine Number
							</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>Date/ Shift</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
								Qty at Check
							</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
								Sign Fab - QA
							</TableCell>
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>QA REMARK</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{data.details && data.details.length > 0 ? (
							data.details
								.filter((detail) => detail.isCompleted === 1)
								.sort((a, b) => new Date(a.checkDateTime) - new Date(b.checkDateTime))
								.map((detail, index) => (
									<TableRow key={index}>
										<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
											{detail.operation_Number}
										</TableCell>
										<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
											{detail.operation_Description}
										</TableCell>
										<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
											{detail.machineNo}
										</TableCell>
										<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
											{dayjs(detail.checkDateTime).format('DD-MM-YYYY')}
											<br />
											{detail.shift}
										</TableCell>
										<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
											{detail.checkQnty}
										</TableCell>
										<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
											{detail.operator}
										</TableCell>
										<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
											{detail.remarks || '--'}
										</TableCell>
									</TableRow>
								))
						) : (
							<TableRow>
								<TableCell colSpan={10} sx={{ border: '0.1px solid black', textAlign: 'center' }}>
									No inspection details available
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</Box>

			{/* Footer Sections */}
			{/* <Box sx={{ mt: 2 }}>
				<Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
					EMBOSING :- {data.embosing || 'SRE61T, SRE61HT, SRE61HT'}
				</Typography>
				<Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1 }}>
					IC/CIP NO :- {data.icCipNo || ''}
				</Typography>
				<Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1 }}>
					BATCH NO :- {data.batchNo || ''}
				</Typography>
				<Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1 }}>
					GALVANISING PROCESS:- AS PER ISO1461-Min Avg Coating...
				</Typography>
			</Box> */}

			{/* Final Section */}
			<Box sx={{ mt: 1, border: '0.1px solid black', width: '100%' }}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>VISUAL</TableCell>
							<TableCell />
							<TableCell />
							<TableCell />
							<TableCell />
						</TableRow>
					</TableHead>
					<TableBody>
						<TableRow>
							<TableCell>COATING THICKNESS</TableCell>
							<TableCell />
							<TableCell />
							<TableCell />
							<TableCell />
						</TableRow>
						<TableRow>
							<TableCell>DESPATCH/ FINAL ACTIVITIES</TableCell>
							<TableCell colSpan={2} />
							<TableCell sx={{ border: '0.1px solid black', textAlign: 'center' }}>
								Galvanizing Quality Inspection Seal
							</TableCell>
							<TableCell>R/R DETAIL</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</Box>

			<Box sx={{ mt: 3, textAlign: 'right' }}>
				<Typography variant="body2">Date: {dayjs().format('DD-MM-YYYY')}</Typography>
			</Box>
		</Box>
	);
};

export default InspectionReportTemplate;
