import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],

	...(process.env.PROXY_BACKEND_URL ? {
		server: {
			proxy: {
				'/graphql': process.env.PROXY_BACKEND_URL || 'http://localhost:8080'
			}
		}
	} : {})
});
