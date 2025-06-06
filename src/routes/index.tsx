import { createFileRoute } from "@tanstack/react-router";
import s from "./hey.module.scss";

export const Route = createFileRoute("/")({
	component: App,
	loader: async ({ context }) => {},
});

function App() {
	return <div className={s.item}>hello world</div>;
}
