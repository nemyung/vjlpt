export interface TTS {
	speak(text: string): Promise<void>;
	stop(): Promise<void>;
}
