import Header from "@/components/Header/Header";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$level")({
	component: RouteComponent,
	loader: async ({ context: { db }, params: { level } }) => {},
});

function RouteComponent() {
	return (
		<div>
			<Header title="Hello $level!" />
		</div>
	);
}
