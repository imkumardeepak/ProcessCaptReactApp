import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { GridToolbar } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { enUS } from '@mui/material/locale';

const theme = createTheme(
	{
		palette: {
			primary: {
				main: '#006BFF', // Set your primary color here (blue)
			},
			secondary: {
				main: '#9c27b0', // Set your secondary color here (purple)
			},
		},
		typography: {
			fontFamily: 'Roboto, sans-serif', // Set your font family if needed
		},
		components: {
			// Customize the DataGrid style here if needed
			MuiDataGrid: {
				styleOverrides: {
					root: {
						backgroundColor: '#fff', // Customize the background color
					},
				},
			},
		},
	},
	enUS, // English locale
);

const CustomDataGrid = ({ columns, data }) => {
	return (
		<ThemeProvider theme={theme}>
			<DataGrid
				autoPageSize
				sx={{
					height: 415, // Adjust the height as per your needs
					width: '100%',
					'& .MuiDataGrid-columnHeaders': {
						position: 'sticky',
						top: 0,
						zIndex: 1, // Keep the header on top
						backgroundColor: 'white', // Ensures the header is visible over the body
					},
					pt: 1,
				}}
				rows={data}
				columns={columns}
				pageSize={5} // Set the number of rows per page to 5 by default
				pageSizeOptions={[5, 10, 25, 50, 100]} // Add options for 5, 10, 25, 50 rows per page
				pagination
				disableSelectionOnClick
				slots={{ toolbar: GridToolbar }}
			/>
		</ThemeProvider>
	);
};

export default CustomDataGrid;
