import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();
const API_BASE_URL = import.meta.env.VITE_APP_API_URL;
export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const token = sessionStorage.getItem('authToken');
		if (token) {
			// Fetch user details from the backend if token exists
			axios
				.get(`${API_BASE_URL}/auth/user`, {
					headers: { Authorization: `Bearer ${token}` },
				})
				.then((response) => {
					setUser(response.data);
				})
				.catch(() => {
					sessionStorage.removeItem('authToken');
					navigate('/'); // Redirect to login on failure
				})
				.finally(() => setLoading(false));
		} else {
			setLoading(false);
			sessionStorage.removeItem('authToken');
			setUser(null);
		}
	}, [navigate]);

	const login = (token, userDetails) => {
		sessionStorage.setItem('authToken', token);
		setUser(userDetails);
		navigate('/dashboard');
	};

	const logout = () => {
		sessionStorage.removeItem('authToken');
		console.log('logout');
		setUser(null);
		navigate('/');
	};

	return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
