import { PGlite } from "@electric-sql/pglite";

export const client = new PGlite(import.meta.env.VITE_CONNECTION_URL, {
	debug: import.meta.env.DEV ? 5 : 0,
});
