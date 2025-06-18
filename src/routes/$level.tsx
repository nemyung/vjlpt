import FlashCard from "@/components/flash-card";
import flashCardStyles from "@/components/flash-card.module.scss";
import { MultipleChoice } from "@/components/multiple-choice-card";
import type { db } from "@/lib/db/drizzle";
import { useDrizzle } from "@/lib/db/provider";
import { type JLPTLevel, isJLPTLevel } from "@/lib/db/schema";
import { createFlashCard } from "@/lib/fsrs/flash-card";
import type { Deck } from "@/lib/fsrs/interface";
import {
  type KanjiToMeaning,
  createKanjiToMeaning,
} from "@/lib/fsrs/kanji-to-meaning";
import {
  type MeaningToKanji,
  createMeaningToKanji,
} from "@/lib/fsrs/meaning-to-kanji";
import { Rating } from "@/lib/fsrs/model";
import {
  RawReading,
  fetchDueReadings,
  fetchNewReadings,
  rate,
} from "@/lib/fsrs/repo";
import { shuffle } from "@/lib/fsrs/shuffle";
import { logDebug } from "@/lib/log";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import styles from "./level.module.scss";

// These can be parameterized
const FLASH_CARD_COUNT = 11;
const KANJI_TO_MEANING_COUNT = 7;
const MEANING_TO_KANJI_COUNT = 7;

const requiredReadings =
  FLASH_CARD_COUNT + KANJI_TO_MEANING_COUNT * 4 + MEANING_TO_KANJI_COUNT * 4;

const createDeck = (allReadings: RawReading[]): Deck => {
  if (allReadings.length < requiredReadings) {
    throw new RangeError("Not enough readings to create a deck");
  }

  const totalQuizAnswers = KANJI_TO_MEANING_COUNT + MEANING_TO_KANJI_COUNT;
  const quizAnswers = allReadings.slice(0, totalQuizAnswers);
  const kanjiToMeaningAnswers = quizAnswers.slice(0, KANJI_TO_MEANING_COUNT);
  const meaningToKanjiAnswers = quizAnswers.slice(KANJI_TO_MEANING_COUNT);

  const kanjiToMeaningCards: KanjiToMeaning[] = [];
  const meaningToKanjiCards: MeaningToKanji[] = [];

  let distractorIndex = 0;
  const distractorPool = shuffle(allReadings.slice(totalQuizAnswers));

  for (const answer of kanjiToMeaningAnswers) {
    const distractors = distractorPool.slice(
      distractorIndex,
      distractorIndex + 3
    );
    distractorIndex += 3;
    kanjiToMeaningCards.push(createKanjiToMeaning(answer, distractors));
  }
  for (const answer of meaningToKanjiAnswers) {
    const distractors = distractorPool.slice(
      distractorIndex,
      distractorIndex + 3
    );
    distractorIndex += 3;
    meaningToKanjiCards.push(createMeaningToKanji(answer, distractors));
  }

  const flashCards = allReadings
    .slice(totalQuizAnswers + distractorIndex)
    .map(createFlashCard);

  return shuffle([
    ...kanjiToMeaningCards,
    ...meaningToKanjiCards,
    ...flashCards,
  ]);
};

const fetchReadingsByLevel =
  (db: db) =>
  async (levelId: JLPTLevel): Promise<Deck> => {
    const dues = (await fetchDueReadings(db)(requiredReadings, levelId)).map(
      (d) => RawReading.parse(d)
    );

    if (dues.length === requiredReadings) {
      return dues.map(createFlashCard);
    }

    const left = requiredReadings - dues.length;

    const newReadings = (await fetchNewReadings(db)(left, levelId)).map((d) =>
      RawReading.parse(d)
    );

    if (dues.length + newReadings.length < requiredReadings) {
      return dues.concat(newReadings).map(createFlashCard);
    }

    const allReadings = [...dues, ...newReadings];
    return createDeck(allReadings);
  };

export const Route = createFileRoute("/$level")({
  component: RouteComponent,
  staleTime: 0,
  gcTime: 0,
  loader: async ({ context: { db }, params }) => {
    const levelId = params.level;
    if (!isJLPTLevel(levelId)) {
      throw redirect({
        to: "/",
        replace: true,
      });
    }

    return {
      levelId,
      deck: await fetchReadingsByLevel(db)(levelId),
    } as const;
  },
});

function RouteComponent() {
  const db = useDrizzle();
  const d = Route.useLoaderData();

  const router = useRouter();

  const goBack = () => {
    navigator.vibrate(50);
    router.navigate({
      to: "/",
      replace: true,
      viewTransition: {
        types: ["slide-right"],
      },
    });
  };

  const [deck, setDeck] = useState(d.deck);
  const [knownCount, setKnownCount] = useState(0);
  logDebug(deck);
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalCards = deck.length;
  const currentFlashCard = deck[currentIndex];
  const progress =
    totalCards === 0 ? "0" : (currentIndex / totalCards).toString();

  const fetchNextFlashCards = async () => {
    setDeck(await fetchReadingsByLevel(db)(d.levelId));
    setCurrentIndex(0);
    setKnownCount(0);
  };

  const onSwipeStart = async (direction: "left" | "right") => {
    const status = direction === "left" ? "unknown" : "known";
    await db.transaction(async (tx) => {
      await rate(tx)(
        currentFlashCard.readingId,
        status === "unknown" ? Rating.Again : Rating.Good
      );
    });
  };

  const goToNext = async (direction: "left" | "right") => {
    setCurrentIndex(currentIndex + 1);
    setKnownCount((p) => p + (direction === "left" ? 0 : 1));
  };

  const showDone = currentIndex >= totalCards;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button type="button" className={styles.closeButton} onClick={goBack}>
          <ChevronLeft />
        </button>

        <div className={styles.progressSection}>
          <div className={styles.progressBarBackground}>
            <div
              style={{ ["--current-progress" as string]: progress }}
              className={styles.progressBarFill}
            />
          </div>
        </div>
      </header>
      <div className={styles.contentContainer}>
        {showDone && (
          <div className={styles.empty}>
            <div className={styles.currentProgressSummary}>
              <p>이번 학습을 모두 마쳤습니다</p>
              <p>총 {totalCards}개의 카드를 학습했어요.</p>
              <p>
                그중 <b>{knownCount}개</b>를 안다고 체크했고,
                <br />
                <b>{totalCards - knownCount}개</b>를 모른다고 체크했어요.
              </p>
            </div>

            <div className={styles.ctaRow}>
              <button type="button" className={styles.cta} onClick={goBack}>
                그만하기
              </button>
              <button
                type="button"
                className={styles.cta}
                onClick={fetchNextFlashCards}
              >
                계속 학습하기
              </button>
            </div>
          </div>
        )}
        {currentFlashCard && currentFlashCard.type === "flash-card" && (
          <div className={styles.cardWrapper}>
            <div className={flashCardStyles.cardLayout} />
            <FlashCard
              key={currentFlashCard.readingId}
              onSwipeLeftStart={() => {
                onSwipeStart("left");
              }}
              onSwipeLeftDone={() => {
                goToNext("left");
              }}
              onSwipeRightStart={() => {
                onSwipeStart("right");
              }}
              onSwipeRightDone={() => {
                goToNext("right");
              }}
              {...currentFlashCard}
            />
          </div>
        )}
        {currentFlashCard && currentFlashCard.type === "kanji-to-meaning" && (
          <div className={styles.cardWrapper}>
            <div className={flashCardStyles.cardLayout} />
            <MultipleChoice
              key={currentFlashCard.readingId}
              readingId={currentFlashCard.readingId}
              question={currentFlashCard.expression}
              options={currentFlashCard.answers}
              onAnswer={(isCorrect) => {
                onSwipeStart(isCorrect ? "right" : "left");
                goToNext(isCorrect ? "right" : "left");
              }}
            />
          </div>
        )}
        {currentFlashCard && currentFlashCard.type === "meaning-to-kanji" && (
          <div className={styles.cardWrapper}>
            <div className={flashCardStyles.cardLayout} />
            <MultipleChoice
              key={currentFlashCard.readingId}
              readingId={currentFlashCard.readingId}
              question={currentFlashCard.meaning}
              options={currentFlashCard.answers}
              onAnswer={(isCorrect) => {
                onSwipeStart(isCorrect ? "right" : "left");
                goToNext(isCorrect ? "right" : "left");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
