import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';

// assets
import logo from '@/assets/images/logo/png/logo.png';

import LoggedUser from './loggedUser';
import SearchBar from './searchBar';

function MainHeader() {
	return (
		<Box bgcolor="background.paper" component="header" py={1.5} zIndex={1}>
			<Stack
				component={Container}
				maxWidth="lg"
				direction="row"
				height={50}
				justifyContent="space-between"
				alignItems="center"
				flexWrap="wrap"
				spacing={3}
				overflow="hidden"
			>
				<Stack direction="row" alignItems="center" spacing={3}>
					<Box
						component="img"
						width={{
							xs: 110,
							sm: 140,
						}}
						src={logo}
						alt="logo"
					/>
					<Typography
						component="sub"
						variant="h3"
						sx={{ paddingTop: 3 }}
						display={{
							xs: 'none',
							sm: 'block',
						}}
					>
						Production Process Tracking System
					</Typography>
				</Stack>
				{/* <SearchBar /> */}
				<LoggedUser />
			</Stack>
		</Box>
	);
}

export default MainHeader;
