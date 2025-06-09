import "ios-vibrator-pro-max";
import "@/lib/scss/global.scss";
//
import { client } from "@/lib/db/dom";
import migrations from "@/lib/db/mg.json";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createDrizzle } from "./lib/db/drizzle";
import { migrateSchema } from "./lib/db/migrate";

import { DrizzleProvider } from "./lib/db/provider";
import { ensureLevels } from "./lib/db/seed";
import reportWebVitals from "./reportWebVitals";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

const db = createDrizzle(client);
// Create a new router instance
const router = createRouter({
	routeTree,
	context: {
		db,
	},
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
console.log("hi");
migrateSchema(db, migrations)
	.then(() => ensureLevels(db))
	.then(() => {
		const rootElement = document.getElementById("app");
		if (rootElement && !rootElement.innerHTML) {
			const root = ReactDOM.createRoot(rootElement);
			root.render(
				<StrictMode>
					<DrizzleProvider db={db}>
						<RouterProvider router={router} />
					</DrizzleProvider>
				</StrictMode>,
			);
		}
	}, console.error);

reportWebVitals();
