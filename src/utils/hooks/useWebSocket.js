import { useEffect, useState } from 'react';

const useWebSocket = () => {
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		const socket = new WebSocket(import.meta.env.VITE_APP_WS_URL);
		socket.onopen = () => {
			console.log('Connected to WebSocket:', import.meta.env.VITE_APP_WS_URL);
		};

		socket.onmessage = (event) => {
			setMessages((prev) => [...prev, event.data]);
		};

		socket.onerror = (error) => {
			// console.error('WebSocket Error:', error);
		};

		socket.onclose = () => {
			// console.log('WebSocket connection closed');
		};

		return () => socket.close();
	});

	return messages;
};

export default useWebSocket;
