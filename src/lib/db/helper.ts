import { ulid } from "ulid";
import { type JLPTLevel, JLPT_LEVELS } from "./schema";

const baseTimestamp = new Date("2025-06-07T03:00:00.000Z").getTime();

function createID() {
	return ulid();
}

function createExpressionId(level: JLPTLevel, nextOrder: number) {
	return ulid(
		baseTimestamp + JLPT_LEVELS.indexOf(level) * 1_000_000 + nextOrder * 16,
	);
}

function createReadingId(level: JLPTLevel, nextOrder: number) {
	return ulid(
		baseTimestamp + JLPT_LEVELS.indexOf(level) * 1_000_000 + nextOrder * 32,
	);
}

function createMeaningId(
	level: JLPTLevel,
	nextOrder: number,
	meaningIndex: number,
) {
	return ulid(
		baseTimestamp +
			JLPT_LEVELS.indexOf(level) * 1_000_000 +
			nextOrder * 64 +
			meaningIndex * 16,
	);
}

export { createExpressionId, createMeaningId, createReadingId, createID };
