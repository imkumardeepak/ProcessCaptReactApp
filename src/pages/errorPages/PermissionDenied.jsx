import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Button } from '@mui/material';
import { motion } from 'framer-motion';
import AccessDeniedIcon from '@mui/icons-material/DoNotDisturbAlt';

function PermissionDenied() {
	const navigate = useNavigate();

	// Container animation with background gradient
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { duration: 1, ease: 'easeOut' },
		},
	};

	// Typewriter effect for heading
	const headingVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.05,
				delayChildren: 0.3,
			},
		},
	};

	const letterVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	};

	// Pulsing icon animation
	const iconVariants = {
		hidden: { scale: 0, opacity: 0 },
		visible: {
			scale: 1,
			opacity: 1,
			transition: { duration: 0.8, ease: 'easeOut' },
		},
		pulse: {
			scale: [1, 1.1, 1],
			transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
		},
	};

	// Button animation with glow effect
	const buttonVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { delay: 0.8, duration: 0.6, ease: 'easeOut' },
		},
		hover: {
			scale: 1.05,
			boxShadow: '0px 0px 15px rgba(25, 118, 210, 0.7)', // Glow effect
			transition: { duration: 0.3 },
		},
		tap: { scale: 0.98 },
	};

	// Split heading into individual letters for typewriter effect
	const headingText = 'Permission Denied'.split('');

	return (
		<Box
			component={motion.div}
			initial="hidden"
			animate="visible"
			variants={containerVariants}
			sx={{
				height: '100vh',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'column',
				textAlign: 'center',
				background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', // Gradient background
				overflow: 'hidden',
			}}
		>
			{/* Animated Heading with Typewriter Effect */}
			<motion.div variants={headingVariants}>
				<Typography
					variant="h1"
					sx={{
						fontSize: { xs: '2.5rem', md: '4.5rem' },
						fontWeight: 800,
						color: '#d32f2f', // Red error color
						letterSpacing: '2px',
						textTransform: 'uppercase',
						background: 'linear-gradient(to right, #d32f2f, #f44336)',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
					}}
				>
					{headingText.map((letter, index) => (
						<motion.span key={index} variants={letterVariants}>
							{letter === ' ' ? '\u00A0' : letter}
						</motion.span>
					))}
				</Typography>
			</motion.div>

			{/* Animated Description */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
			>
				<Typography
					variant="h6"
					sx={{
						fontSize: { xs: '1rem', md: '1.3rem' },
						color: 'text.secondary',
						maxWidth: '600px',
						px: 2,
						mt: 2,
					}}
				>
					You don’t have the required permissions to access this page. Please contact your administrator.
				</Typography>
			</motion.div>

			{/* Pulsing Icon */}
			<motion.div variants={iconVariants} animate="pulse" sx={{ mt: 4 }}>
				<AccessDeniedIcon sx={{ fontSize: { xs: 80, md: 120 }, color: '#d32f2f' }} />
			</motion.div>

			{/* Animated Button with Glow */}
			<motion.div variants={buttonVariants}>
				<Button
					component={motion.button}
					variants={buttonVariants}
					whileHover="hover"
					whileTap="tap"
					variant="contained"
					onClick={() => navigate('/dashboards/dashboard3')}
					sx={{
						mt: 4,
						px: 4,
						py: 1.5,
						borderRadius: '30px',
						fontSize: '1.1rem',
						fontWeight: 600,
						textTransform: 'none',
						backgroundColor: '#1976d2',
						'&:hover': {
							backgroundColor: '#1565c0',
						},
					}}
				>
					Return to Dashboard
				</Button>
			</motion.div>
		</Box>
	);
}

export default PermissionDenied;
