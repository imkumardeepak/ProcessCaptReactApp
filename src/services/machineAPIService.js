// apiService.js
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

/**
 * Get JWT token from sessionStorage
 */
const getAuthToken = () => sessionStorage.getItem('authToken');

/**
 * Handle token expiration by redirecting to the login page.
 */
const handleTokenExpiry = (navigate) => {
	sessionStorage.removeItem('authToken'); // Clear the token
	enqueueSnackbar('Session expired. Redirecting to login...', { variant: 'warning' });
	navigate('/'); // Redirect to login
};

/**
 * Custom hook to handle API requests and authentication
 */
// eslint-disable-next-line import/prefer-default-export
export const useApi = () => {
	const navigate = useNavigate();

	const fetchData = async (endpoint) => {
		try {
			const token = getAuthToken();
			if (!token) {
				handleTokenExpiry(navigate);
				return false;
			}

			const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.status === 401) {
				handleTokenExpiry(navigate);
				return false;
			}

			if (!response.ok) {
				throw new Error(`Failed to fetch data. HTTP Status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			// enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
			return false;
		}
	};

	const deleteResource = async (endpoint, id, onSuccess, onError) => {
		try {
			const token = getAuthToken();
			if (!token) {
				handleTokenExpiry(navigate);
				return false;
			}

			const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
				method: 'DELETE',
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.status === 401) {
				handleTokenExpiry(navigate);
				return false;
			}

			if (response.ok) {
				if (onSuccess) onSuccess();
				return true;
			}

			const errorMessage = `Failed to delete resource. HTTP Status: ${response.status}`;
			enqueueSnackbar(errorMessage, { variant: 'error' });
			if (onError) onError(new Error(errorMessage));
			return false;
		} catch (error) {
			enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
			if (onError) onError(error);
			return false;
		}
	};

	const createResource = async (endpoint, data, onSuccess, onError) => {
		try {
			const token = getAuthToken();
			if (!token) {
				handleTokenExpiry(navigate);
				return false;
			}

			const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(data),
			});

			if (response.status === 401) {
				handleTokenExpiry(navigate);
				return false;
			}

			if (response.ok) {
				if (onSuccess) onSuccess();
				return true;
			}

			const errorData = await response.json();
			const errorMessage = errorData.message || `Failed to create resource. HTTP Status: ${response.status}`;
			enqueueSnackbar(errorMessage, { variant: 'error' });
			if (onError) onError(new Error(errorMessage));
			return false;
		} catch (error) {
			enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
			if (onError) onError(error);
			return false;
		}
	};

	const updateResource = async (endpoint, id, data, onSuccess, onError) => {
		try {
			const token = getAuthToken();
			if (!token) {
				handleTokenExpiry(navigate);
				return false;
			}

			const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
				method: 'PUT',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(data),
			});

			if (response.status === 401) {
				handleTokenExpiry(navigate);
				return false;
			}

			if (response.ok) {
				if (onSuccess) onSuccess();
				return true;
			}

			const errorData = await response.json();
			const errorMessage = errorData.message || `Failed to update resource. HTTP Status: ${response.status}`;
			enqueueSnackbar(errorMessage, { variant: 'error' });
			if (onError) onError(new Error(errorMessage));
			return false;
		} catch (error) {
			enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });
			if (onError) onError(error);
			return false;
		}
	};

	return { fetchData, deleteResource, createResource, updateResource };
};
