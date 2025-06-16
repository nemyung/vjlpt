import { useWebSpeechTTS } from "@/lib/tts/web-speech";
import { animated, config, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { Volume2 } from "lucide-react";
import * as React from "react";
import styles from "./flash-card.module.scss";

const defaultFlashcardConfig = config.stiff;

type Props = {
	id: string;
	expression: string;
	furigana: string;
	meanings: string[];
	onSwipeRightStart: () => void;
	onSwipeRightDone: () => void;
	onSwipeLeftStart: () => void;
	onSwipeLeftDone: () => void;
};

function FlashCard({
	expression,
	furigana,
	meanings,
	onSwipeRightStart,
	onSwipeLeftStart,
	onSwipeRightDone,
	onSwipeLeftDone,
}: Props) {
	const tts = useWebSpeechTTS();
	const [hintState, setHintState] = React.useState<"hide" | "open">("hide");

	// Spring animation for position, rotation, and flip
	const [{ x, y, rotate }, api] = useSpring(() => ({
		x: 0,
		y: 0,
		rotate: 0,
		config: { tension: 100, friction: 30 },
	}));

	// Drag gesture handler (drag only)
	const bind = useDrag(({ down, movement: [dx, dy] }) => {
		tts.stop();
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
				Promise.all([
					...api.start({
						x: window.innerWidth,
						y: dy,
						rotate: rotation,
						config: defaultFlashcardConfig,
					}),
					onSwipeRightStart(),
				]).then((ret) => {
					const apiResult = ret[0];
					if (apiResult?.finished) {
						onSwipeRightDone();
					}
				});
			} else {
				Promise.all([
					...api.start({
						x: -window.innerWidth,
						y: dy,
						rotate: rotation,
						config: defaultFlashcardConfig,
					}),
					onSwipeLeftStart(),
				]).then((ret) => {
					const apiResult = ret[0];
					if (apiResult?.finished) {
						onSwipeLeftDone();
					}
				});
			}
		} else {
			api.start({
				x: 0,
				y: 0,
				rotate: 0,
				config: config.stiff,
			});
		}
	});

	const handleClick = () => {
		setHintState((prev) => (prev === "hide" ? "open" : "hide"));
	};

	const handleTTSClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (tts.playing) {
			tts.stop();
		} else {
			tts.speak(furigana || expression);
		}
	};

	return (
		<>
			<animated.div
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
							<p className={styles.expression}>{expression}</p>
							<p className={styles.meaning}>{meanings.join(", ")}</p>
						</div>
					</div>
				</div>
			</animated.div>
			<button
				type="button"
				className={styles.ttsButton}
				onClickCapture={handleTTSClick}
				aria-label="음성 재생"
			>
				<Volume2 size={20} />
			</button>
		</>
	);
}

export default FlashCard;
