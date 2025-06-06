import * as React from "react";
import type { db } from "./drizzle";

const DrizzleContext = React.createContext<db | null>(null);

export function DrizzleProvider({
	children,
	db,
}: { children: React.ReactNode; db: db }) {
	return (
		<DrizzleContext.Provider value={db}>{children}</DrizzleContext.Provider>
	);
}

export function useDrizzle() {
	const db = React.useContext(DrizzleContext);
	if (!db) {
		throw new Error("useDrizzle must be used within a DrizzleProvider");
	}
	return db;
}
