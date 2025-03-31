import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import * as path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	base: '/', // Base URL for the app
	plugins: [
		react(),
		VitePWA({
			registerType: 'autoUpdate', // Automatically update the service worker
			includeAssets: ['logo.png', 'logo.svg'], // Assets to cache
			manifest: {
				name: 'Process Capture & Tracking System', // Full name of your app
				short_name: 'Process Capture & Tracking', // Short name for the home screen
				description: 'Process Capture & Tracking System', // Description
				theme_color: '#ffffff', // Theme color for the browser UI
				background_color: '#ffffff', // Background color during load
				display: 'standalone', // Makes it look like a native app
				scope: '/', // Scope of the PWA
				start_url: '/', // URL to open when launched
				icons: [
					{
						src: '/196.png',
						sizes: '196x196',
						type: 'image/png',
					},
					{
						src: '/512.png',
						sizes: '512x512',
						type: 'image/png',
					},
				],
			},
			devOptions: {
				enabled: true, // Enable PWA in development mode
			},
		}),
	],
	server: {
		host: true,
		port: 5173,
		strictPort: true,
		allowedHosts: ['.ngrok-free.app', '.trycloudflare.com'],
	},
	resolve: {
		alias: [
			{ find: '@', replacement: path.resolve(__dirname, 'src') },
			{ find: '@helpers', replacement: path.resolve(__dirname, 'src/utils/helpers') },
			{ find: '@hooks', replacement: path.resolve(__dirname, 'src/utils/hooks') },
			{ find: '@hocs', replacement: path.resolve(__dirname, 'src/utils/hocs') },
		],
	},
});
