import { Lightbulb } from "lucide-react";
import * as React from "react";
import styles from "./flash-card.module.scss";

type Props = {
	id: string;
	expression: string;
	furigana: string;
	meanings: string[];
};

function FlashCard({ expression, furigana, meanings }: Props) {
	const [hintState, setHintState] = React.useState<"hide" | "open">("hide");
	return (
		<div className={styles.outer}>
			<button
				className={styles.hintButton}
				type="button"
				onClick={() => {
					setHintState((prev) => (prev === "hide" ? "open" : "hide"));
				}}
			>
				<Lightbulb />
			</button>
			<div className={styles.expressionWrapper}>
				<p
					style={{ opacity: hintState === "hide" ? 0 : 1 }}
					className={styles.furigana}
				>
					{furigana}
				</p>
				<p className={styles.expression}>{expression}</p>
				<p
					style={{ opacity: hintState === "hide" ? 0 : 1 }}
					className={styles.meaning}
				>
					{meanings.join(", ")}
				</p>
			</div>
		</div>
	);
}

export default React.memo(FlashCard, (p, n) => {
	return p.id === n.id;
});
