import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		reporters: "verbose",
		environment: "jsdom",
		css: true,
		globals: true,
		restoreMocks: true,
		setupFiles: ['./src/vitest/register-matchers.ts']
	}
});
