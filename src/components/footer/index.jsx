// MUI

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import Container from '@mui/material/Container';

function Footer() {
	return (
		<Box
			bgcolor={(theme) => theme.palette.background.default}
			mt={2}
			py={2}
			borderTop={2}
			borderColor="primary.400"
		>
			<Container maxWidth="lg" component={Stack} direction="column" spacing={4}>
				<Stack direction={{ lg: 'row' }} justifyContent="space-between" alignItems="center" flexWrap="wrap">
					<Typography variant="body2" textAlign="center">
						Copyright 2024 © Aarkay Techno Consultants Pvt. Ltd.
					</Typography>
				</Stack>
			</Container>
		</Box>
	);
}

export default Footer;
