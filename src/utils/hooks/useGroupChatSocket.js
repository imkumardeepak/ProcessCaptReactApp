import { useEffect, useState } from 'react';

const useGroupChatSocket = (userId) => {
	const [socket, setSocket] = useState(null);
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		if (!userId) return;

		const newSocket = new WebSocket(`${import.meta.env.VITE_APP_CHAT_URL}/${userId}`);

		newSocket.onopen = () => {
			console.log('Connected to WebSocket:', `${import.meta.env.VITE_APP_CHAT_URL}/${userId}`);
		};

		newSocket.onmessage = (event) => {
			try {
				const chatMessage = JSON.parse(event.data);
				setMessages((prevMessages) => [...prevMessages, chatMessage]);
			} catch (error) {
				console.error('Failed to parse message', error);
			}
		};

		newSocket.onclose = () => {
			// console.log('WebSocket closed.');
		};

		newSocket.onerror = (error) => {
			// console.error('WebSocket error:', error);
		};

		setSocket(newSocket);

		return () => {
			newSocket.close();
		};
	}, [userId]);

	const sendMessage = (message) => {
		if (socket) {
			socket.send(JSON.stringify(message));
		}
	};

	return { messages, sendMessage };
};

export default useGroupChatSocket;
