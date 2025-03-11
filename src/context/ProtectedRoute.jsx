import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Box, CircularProgress } from '@mui/material';

function ProtectedRoute({ children, requiredRole }) {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div>
				<Box display="flex" justifyContent="center" alignItems="center" height="100vh">
					<CircularProgress />
				</Box>
			</div>
		); // Show a loading spinner if data is still fetching
	}

	if (!user) {
		return <Navigate to="/" replace />;
	}

	const hasRequiredRole = Array.isArray(requiredRole) ? requiredRole.includes(user.role) : user.role === requiredRole;
	if (requiredRole && !hasRequiredRole) {
		return <Navigate to="/permission-denied" replace />;
	}

	return user ? children : <Navigate to="/" replace />;
}

export default ProtectedRoute;
