import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { createTheme, ThemeProvider, useTheme, Box, Button } from '@mui/material';
import { ImFileExcel, ImFilePdf } from 'react-icons/im';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { mkConfig } from 'export-to-csv';

function DataTable({ columns, data }) {
	const globalTheme = useTheme();

	const tableTheme = useMemo(
		() =>
			createTheme({
				palette: {
					mode: globalTheme.palette.mode, // Use the global theme mode (light/dark)
					primary: globalTheme.palette.primary, // Use primary color from global theme
					info: {
						main: '#006BFF', // Custom color for alerts, if applicable
					},
					background: {
						default: '#fff', // Force white background
						paper: '#fff', // Force white background for paper components
					},
				},
				components: {
					MuiPaper: {
						styleOverrides: {
							root: {
								backgroundColor: '#fff', // Force white for Paper components
							},
						},
					},
					MuiTooltip: {
						styleOverrides: {
							tooltip: {
								fontSize: '1rem', // Override tooltip font size
							},
						},
					},
					MuiTableRow: {
						styleOverrides: {
							root: {
								height: 45, // Adjust row height
								padding: 0, // Remove padding
							},
						},
					},
					MuiTableCell: {
						styleOverrides: {
							root: {
								padding: 4, // Adjust cell padding
							},
						},
					},
					MuiSwitch: {
						styleOverrides: {
							thumb: {
								color: globalTheme.palette.primary.main, // Change switch thumb color
							},
						},
					},
				},
			}),
		[globalTheme],
	);

	const memoizedColumns = useMemo(() => columns, [columns]);

	// CSV export configuration
	const csvConfig = mkConfig({
		fieldSeparator: ',',
		decimalSeparator: '.',
		useKeysAsHeaders: true,
	});

	const handleExportExcelWithTheme = (rows) => {
		// Step 1: Create a new workbook
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Sheet 1');

		// Step 2: Define headers
		const headers = Object.keys(rows[0].original).map((header) => header.toUpperCase());
		const headerRow = worksheet.addRow(headers);

		// Step 3: Apply header styles
		headerRow.eachCell((cell) => {
			cell.font = {
				name: 'Calibri', // Use default Calibri font
				bold: true,
				size: 12,
			};
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'AAB99A' }, // Light pink background for headers
			};
			cell.alignment = {
				vertical: 'middle',
				horizontal: 'center',
			};
			cell.border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			};
		});

		// Step 4: Add rows of data and apply styles
		rows.forEach((row) => {
			const dataRow = worksheet.addRow(Object.values(row.original));
			dataRow.eachCell((cell) => {
				cell.font = {
					name: 'Calibri', // Use default Calibri font
					size: 11,
				};
				cell.alignment = {
					vertical: 'middle',
					horizontal: 'left',
				};
				cell.border = {
					top: { style: 'thin' },
					left: { style: 'thin' },
					bottom: { style: 'thin' },
					right: { style: 'thin' },
				};
			});
		});

		// Step 5: Adjust column widths automatically
		worksheet.columns.forEach((column) => {
			let maxLength = 0;
			column.eachCell({ includeEmpty: true }, (cell) => {
				const cellValue = cell.value || '';
				maxLength = Math.max(maxLength, cellValue.toString().length);
			});
			column.width = maxLength + 2; // Add extra padding
		});

		// Step 6: Save the workbook to file
		workbook.xlsx.writeBuffer().then((buffer) => {
			const blob = new Blob([buffer], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			});
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = 'export.xlsx';
			link.click();
		});
	};

	// PDF export function using jsPDF and jsPDF autotable
	const handleExportPdf = (rows, columns) => {
		const doc = new jsPDF({
			orientation: 'landscape',
			format: 'a3',
		});

		// Define title
		const title = 'Data Export';
		doc.setFont('Helvetica', 'bold');
		doc.setFontSize(18);
		doc.text(title, 14, 20); // Add title to the top of the PDF

		// Define headers (convert to uppercase)
		const headers = Object.keys(rows[0].original).map((header) => header.toUpperCase());

		// Extract table data
		const tableData = rows.map((row) => Object.values(row.original));

		// Add table using autoTable
		autoTable(doc, {
			head: [headers],
			body: tableData,
			startY: 30, // Start below the title
			styles: {
				font: 'Helvetica',
				fontSize: 10,
				halign: 'center', // Center-align text
				valign: 'middle', // Middle-align vertically
			},
			headStyles: {
				fillColor: [63, 81, 181], // Indigo header background
				textColor: [255, 255, 255], // White text color
				fontSize: 12,
				halign: 'center',
				bold: true,
			},
			alternateRowStyles: {
				fillColor: [245, 245, 245], // Light grey for alternating rows
			},
			bodyStyles: {
				textColor: [0, 0, 0], // Black text color for body rows
			},
			columnStyles: {
				0: { halign: 'left' }, // First column aligns to the left
			},
			margin: { top: 30, bottom: 20, left: 14, right: 14 },
		});

		// Footer
		const pageCount = doc.getNumberOfPages();
		for (let i = 1; i <= pageCount; i++) {
			doc.setPage(i);
			doc.setFont('Helvetica', 'normal');
			doc.setFontSize(10);
			const footerText = `Page ${i} of ${pageCount}`;
			doc.text(footerText, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, {
				align: 'right',
			});
		}

		// Save PDF
		doc.save('export.pdf');
	};

	return (
		<div style={{ padding: '0px' }}>
			<ThemeProvider theme={tableTheme}>
				<MaterialReactTable
					columns={memoizedColumns}
					data={data}
					// enableRowNumbers={true}
					// rowNumberDisplayMode="static"
					initialState={{
						pagination: { pageSize: 10, pageIndex: 0 },
						density: 'compact',
					}}
					enableSorting
					enableColumnResizing
					enableGlobalFilter
					enableGrouping
					enableRowNumbers
					enableBottomToolbar
					enableStickyHeader
					enableStickyFooter
					renderTopToolbarCustomActions={({ table }) => (
						<Box
							sx={{
								display: 'flex',
								gap: '4px',
								padding: '2px',
								flexWrap: 'wrap',
							}}
						>
							<Button
								color="success"
								disabled={table.getPrePaginationRowModel().rows.length === 0}
								onClick={() => handleExportExcelWithTheme(table.getPrePaginationRowModel().rows)}
								startIcon={<ImFileExcel />}
							>
								Export Excel
							</Button>
							<Button
								color="error"
								disabled={table.getPrePaginationRowModel().rows.length === 0}
								onClick={() => handleExportPdf(table.getPrePaginationRowModel().rows)}
								startIcon={<ImFilePdf />}
							>
								Export PDF
							</Button>
						</Box>
					)}
				/>
			</ThemeProvider>
		</div>
	);
}

// Prop validation for better maintainability
DataTable.propTypes = {
	columns: PropTypes.arrayOf(
		PropTypes.shape({
			accessorKey: PropTypes.string.isRequired,
			header: PropTypes.string.isRequired,
			size: PropTypes.number,
			renderCell: PropTypes.func,
		}),
	).isRequired,
	data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default DataTable;
