import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { normalize, resolve } from "node:path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [TanStackRouterVite({ autoCodeSplitting: true }), viteReact()],
	test: {
		globals: true,
		environment: "jsdom",
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
	css: {
		modules: {
			localsConvention: "camelCase",
		},
		preprocessorOptions: {
			scss: {
				additionalData: (source, filename) => {
					const normalized = normalize("lib/scss/");
					if (filename.includes(normalized)) {
						return source;
					}

					return `
					@use "@/lib/scss/var" as *;
					@use "@/lib/scss/unit" as *;\n
					${source}
					`;
				},
			},
		},
	},
});
