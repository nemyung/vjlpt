import { defineConfig } from "drizzle-kit";

const config = defineConfig({
	schema: "./src/lib/db/schema.ts",
	out: "./migrations",
	dialect: "postgresql",
  dbCredentials: {
    url: import.meta.env.VITE_CONNECTION_URL
  }
});
export default config;
