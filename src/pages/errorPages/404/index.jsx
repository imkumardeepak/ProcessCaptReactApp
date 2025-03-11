import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// MUI Components
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

// Icons
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

function PageNotFound() {
	const location = useLocation();

	// Animation Variants
	const containerVariants = {
		hidden: { opacity: 0, y: -50 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.8, ease: 'easeOut' },
		},
	};

	const textVariants = {
		hidden: { opacity: 0, scale: 0.9 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: { duration: 0.8, delay: 0.3, ease: 'easeOut' },
		},
	};

	const iconVariants = {
		hidden: { opacity: 0, rotate: -90 },
		visible: {
			opacity: 1,
			rotate: 0,
			transition: { duration: 0.8, delay: 0.6, ease: 'easeOut' },
		},
	};
	// Animation variants for the heading (3D effect)
	const headingVariants = {
		hidden: { opacity: 0, rotateY: -90 },
		visible: {
			opacity: 1,
			rotateY: 0,
			transition: { duration: 1, ease: 'easeOut' },
		},
	};
	const buttonVariants = {
		hidden: { opacity: 0, scale: 0.9 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: { duration: 0.8, delay: 0.9, ease: 'easeOut' },
		},
		whileHover: { scale: 1.1, boxShadow: '0px 8px 15px rgba(0,0,0,0.2)', transition: { duration: 0.3 } },
		whileTap: { scale: 0.95 },
	};

	return (
		<Stack
			px={5}
			direction="column"
			spacing={2}
			justifyContent="center"
			alignItems="center"
			minHeight="100vh"
			color="text.tertiary"
			component={motion.div}
			initial="hidden"
			animate="visible"
			variants={containerVariants}
		>
			{/* 3D Heading Animation */}
			<motion.div variants={headingVariants}>
				<Typography
					variant="h1"
					color="error"
					gutterBottom
					sx={{
						fontSize: '4rem',
						fontWeight: 700,
						borderBottom: '3px dotted rgba(255, 0, 0, 0.7)',
					}}
				>
					PAGE NOT FOUND
				</Typography>
			</motion.div>
			<motion.div variants={textVariants}>
				<Typography variant="h2" color="inherit" sx={{ fontWeight: 600 }}>
					Oopps. The page you were looking for doesn't exist.
				</Typography>
			</motion.div>
			<motion.div variants={textVariants}>
				<Typography variant="body2" color="inherit" sx={{ textAlign: 'center' }}>
					The page you are looking for <strong>{location.pathname}</strong> doesn't exist or another error
					occurred. Go back, or choose a new direction.
				</Typography>
			</motion.div>
			<motion.div variants={iconVariants}>
				<SentimentVeryDissatisfiedIcon sx={{ fontSize: 80, color: 'error.main' }} />
			</motion.div>
			<motion.div variants={buttonVariants}>
				<Button
					variant="outlined"
					size="large"
					component={Link}
					to="/dashboards/dashboard3"
					sx={{ marginTop: 3, borderRadius: '20px' }}
					whileHover="whileHover"
					whileTap="whileTap"
				>
					Back to Home
				</Button>
			</motion.div>
		</Stack>
	);
}

export default PageNotFound;
