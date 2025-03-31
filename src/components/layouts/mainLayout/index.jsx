import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import withScrollTopFabButton from '@hocs/withScrollTopFabButton';
import WidthPageTransition from '@hocs/widthPageTransition';
import { useSelector } from '@/store';
import { selectThemeConfig } from '@/store/theme/selectors';

// MUI
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Fab from '@mui/material/Fab';

// Icons
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// Components
import Footer from '@/components/footer';
import MainHeader from '@/components/mainHeader';
import Navbar from '@/components/navbar';
import navItems from './navItems';

function FabButton() {
	return (
		<Fab size="small" aria-label="scroll back to top" color="primary">
			<KeyboardArrowUpIcon />
		</Fab>
	);
}

function MainLayout({ container = 'lg', pb = true }) {
	const location = useLocation();
	const { pageTransitions } = useSelector(selectThemeConfig);

	return (
		<Box
			display="flex"
			minHeight="100vh"
			flexDirection="column"
			sx={{
				width: '100%', // Take up full width
				overflowX: 'hidden', // Prevent horizontal scrollbar
			}}
		>
			<Header />
			<Box
				sx={{
					flex: '1 0 auto',
					width: '100%', // Take up full width
					padding: (theme) => theme.spacing(3), // Consistent padding
					...(pb && {
						paddingBottom: 0,
					}),
				}}
			>
				{pageTransitions ? (
					<WidthPageTransition location={location.key}>
						<Outlet />
					</WidthPageTransition>
				) : (
					<Outlet />
				)}
			</Box>
			{withScrollTopFabButton(FabButton)}
			<Footer />
		</Box>
	);
}

function Header() {
	const { stickyHeader } = useSelector(selectThemeConfig);

	return (
		<>
			<MainHeader />
			<Navbar navItems={navItems} position={stickyHeader ? 'sticky' : 'static'} />
		</>
	);
}

export default MainLayout;
