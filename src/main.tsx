import { client } from "@/lib/db/dom";
import migrations from "@/lib/db/mg.json";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createDrizzle } from "./lib/db/drizzle";
import { migrateSchema } from "./lib/db/migrate";

import { DrizzleProvider } from "./lib/db/provider";
import { seed } from "./lib/db/seed";
import reportWebVitals from "./reportWebVitals";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({
	routeTree,
	context: {},
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
});

const db = createDrizzle(client);

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

migrateSchema(db, migrations)
	.then(() => seed(db))
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
