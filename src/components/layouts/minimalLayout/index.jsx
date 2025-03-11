import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';

function MinimalLayout() {
	return (
		<Box
			component="main"
			minHeight="100vh"
			display="flex"
			justifyContent="center"
			alignItems="center"
			sx={{
				backgroundImage: `url(/wave-haikei.svg)`, // Corrected with url()
				backgroundSize: 'cover', // Ensures the image covers the entire Box
				backgroundPosition: 'center', // Centers the image
				backgroundRepeat: 'no-repeat', // Prevents tiling
			}}
		>
			<Outlet />
		</Box>
	);
}

export default MinimalLayout;
