import { drizzle } from "drizzle-orm/pglite";
import { client } from "./dom";

export const db = drizzle(client);
