import { defineConfig } from "drizzle-kit";

const config = defineConfig({
	schema: "./src/lib/db/schema.ts",
	out: "./drizzle/",
	dialect: "postgresql",
  dbCredentials: {
    url: "./pglite"
  }
});
export default config;
