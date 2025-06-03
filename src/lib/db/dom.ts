import { PGlite } from "@electric-sql/pglite";

export const client = new PGlite(import.meta.env.VITE_CONNECTION_URL);
