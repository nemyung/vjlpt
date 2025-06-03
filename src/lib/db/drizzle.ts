import type { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

import * as schema from "./schema";

export const createDrizzle = (client: PGlite) => {
	return drizzle({ client, schema });
};

export type db = ReturnType<typeof createDrizzle>;
