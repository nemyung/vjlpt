import { logError } from "@/lib/log";
import { useState } from "react";
import styles from "./multiple-choice.module.scss";

type Props = {
	readingId: string;
	question: string;
	options: Array<{ readingId: string; text: string }>;
	onAnswer: (isCorrect: boolean) => void;
};

export function MultipleChoice({
	readingId,
	question,
	options,
	onAnswer,
}: Props) {
	const [selectedId, setSelectedId] = useState<string>();

	const correctAnswer = options.find(
		(option) => option.readingId === readingId,
	);

	if (!correctAnswer) {
		logError("An Error Occured while rendering MultipleChoice");
		logError({ readingId });
		logError({ options });
		throw new Error("Correct answer not found");
	}

	const handleAnswerClick = (answerId: string) => {
		if (selectedId) {
			return;
		}
		console.log(answerId);
		setSelectedId(answerId);
	};

	const showAnswer = selectedId !== undefined;

	return (
		<>
			<article className={styles.quizCard}>
				<div className={styles.quizQuestionTextWrapper}>
					<p className={styles.quizQuestionText}>{question}</p>
				</div>

				<div style={{ flexShrink: 0, flex: 1 }}>
					<div className={styles.quizOptions}>
						{options.map((option) => (
							<button
								data-state={
									!showAnswer
										? undefined
										: option.readingId === correctAnswer.readingId
											? "correct"
											: "incorrect"
								}
								key={option.readingId}
								type="button"
								className={styles.quizOption}
								onClick={() => handleAnswerClick(option.readingId)}
								disabled={selectedId !== undefined}
							>
								{option.text}
							</button>
						))}
					</div>

					<div style={{ marginTop: 16 }}>
						<button
							data-open={showAnswer}
							className={styles.cta}
							type="button"
							onClick={() => onAnswer(selectedId === correctAnswer.readingId)}
						>
							다음으로
						</button>
					</div>
				</div>
			</article>
		</>
	);
}
