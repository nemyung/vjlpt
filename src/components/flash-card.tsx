import { animated, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import * as React from "react";
import styles from "./flash-card.module.scss";

type Props = {
	id: string;
	expression: string;
	furigana: string;
	meanings: string[];
	onSwipeRight?: () => void;
	onSwipeLeft?: () => void;
};

function FlashCard({
	expression,
	furigana,
	meanings,
	onSwipeRight,
	onSwipeLeft,
}: Props) {
	const [hintState, setHintState] = React.useState<"hide" | "open">("hide");
	const cardRef = React.useRef<HTMLDivElement>(null);

	// Spring animation for position, rotation, and flip
	const [{ x, y, rotate }, api] = useSpring(() => ({
		x: 0,
		y: 0,
		rotate: 0,
		config: { tension: 100, friction: 30 },
	}));

	// Drag gesture handler (drag only)
	const bind = useDrag(({ down, movement: [dx, dy] }) => {
		const rotation = dx * 0.05;
		const clamped = Math.min(rotation, 8);
		const trigger = Math.abs(dx) > 100;

		if (down) {
			api.start({
				x: dx,
				y: dy,
				rotate: clamped,
				immediate: true,
			});
		} else if (trigger) {
			if (dx > 0) {
				// Swipe right
				api
					.start({
						x: window.innerWidth,
						y: dy,
						rotate: rotation,
						config: { tension: 200, friction: 20 },
					})[0]
					.then(() => {
						onSwipeRight?.();
					});
			} else {
				// Swipe left
				api
					.start({
						x: -window.innerWidth,
						y: dy,
						rotate: rotation,
						config: { tension: 200, friction: 20 },
					})[0]
					.then(() => {
						onSwipeLeft?.();
					});
			}
		} else {
			api.start({
				x: 0,
				y: 0,
				rotate: 0,
				config: { tension: 200, friction: 20 },
			});
		}
	});

	// Click handler (flip only)
	const handleClick = () => {
		setHintState((prev) => (prev === "hide" ? "open" : "hide"));
	};

	return (
		<animated.div
			ref={cardRef}
			{...bind()}
			className={styles.outer}
			style={{
				x,
				y,
				rotate: rotate.to((r: number) => `${r}deg`),
			}}
			onClick={handleClick}
		>
			<div data-state={hintState} className={styles.cardInner}>
				<div className={styles.cardFace}>
					<p className={styles.expression}>{expression}</p>
				</div>

				<div className={`${styles.cardFace} ${styles.cardBack}`}>
					<div className={styles.expressionWrapper}>
						<p className={styles.furigana}>{furigana}</p>
						<p className={styles.meaning}>{meanings.join(", ")}</p>
					</div>
				</div>
			</div>
		</animated.div>
	);
}

export default FlashCard;
