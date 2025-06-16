import EasySpeech from "easy-speech";
import { useMemo, useSyncExternalStore } from "react";
import { logError } from "../log";
import type { TTS } from "./interface";

export class WebSpeechTTS implements TTS {
	#playing = false;
	#allVoices: SpeechSynthesisVoice[] = [];
	#currentVoice!: SpeechSynthesisVoice;
	#listeners: Set<() => void> = new Set();

	async #ensureInit() {
		const statusResult = await EasySpeech.status();

		if (statusResult.status !== "created") {
			if (statusResult.initialized === false) {
				throw new Error("Web Speech API is not initialized");
			}
			return;
		}

		await EasySpeech.init({
			maxTimeout: 10000,
			interval: 500,
		});

		this.#allVoices = EasySpeech.voices().filter((v) => v.lang === "ja-JP");
		const remoteVoice = this.#allVoices.find((v) => v.localService === false);
		this.#currentVoice = remoteVoice ?? this.#allVoices[0];
		// FIXME: do we really need this workaround?
		try {
			await EasySpeech.speak({
				text: " ",
				voice: this.#currentVoice,
				volume: 0,
				rate: 10,
			});
		} finally {
			this.stop();
		}
	}

	async speak(text: string) {
		await this.#ensureInit();

		if (this.#playing) {
			return;
		}
		this.#playing = true;

		try {
			for (const listener of this.#listeners) {
				listener();
			}

			await EasySpeech.speak({
				text,
				voice: this.#currentVoice,
				volume: 1,
				error: () => {
					this.stop();
				},
				end: () => {
					this.stop();
				},
			});
		} catch (e) {
			logError("an error while speaking", e);
			this.stop();
		}
	}

	async stop() {
		await this.#ensureInit();
		EasySpeech.cancel();
		this.#playing = false;
		for (const listener of this.#listeners) {
			listener();
		}
	}

	subscribe = (listener: () => void) => {
		this.#listeners.add(listener);
		return () => this.#listeners.delete(listener);
	};

	getSnapshot = () => {
		return this.#playing;
	};
}

const tts = new WebSpeechTTS();
export function useWebSpeechTTS() {
	const playing = useSyncExternalStore(tts.subscribe, tts.getSnapshot);
	return useMemo(() => {
		return {
			playing,
			speak: tts.speak.bind(tts),
			stop: tts.stop.bind(tts),
		};
	}, [playing]);
}
