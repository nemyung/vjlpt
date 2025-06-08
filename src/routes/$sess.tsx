import { sessionsTable } from "@/lib/db/schema";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";

export const Route = createFileRoute("/$sess")({
	component: RouteComponent,
	loader: async ({ context: { db }, params }) => {
		const session = await db
			.select()
			.from(sessionsTable)
			.where(eq(sessionsTable.id, params.sess));
		return session[0];
	},
});

function RouteComponent() {
	const session = Route.useLoaderData();
	return <div>{session.levelId}</div>;
}
