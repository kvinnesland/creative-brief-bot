"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type SpeechState = "idle" | "listening" | "unavailable";

interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

interface SpeechWindow {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

interface UseSpeechRecognitionOptions {
  onResult: (transcript: string) => void;
  onEnd?: () => void;
  lang?: string;
}

export function useSpeechRecognition({ onResult, onEnd, lang = "nb-NO" }: UseSpeechRecognitionOptions) {
  const [state, setState] = useState<SpeechState>("idle");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const win = typeof window !== "undefined" ? (window as unknown as SpeechWindow) : undefined;
    const SpeechRecognitionAPI = win?.SpeechRecognition ?? win?.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setState("unavailable");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (transcript) onResult(transcript);
    };

    recognition.onend = () => {
      setState((prev) => (prev === "listening" ? "idle" : prev));
      onEnd?.();
    };

    recognition.onerror = () => {
      setState("idle");
    };

    recognitionRef.current = recognition;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const start = useCallback(() => {
    if (!recognitionRef.current || state !== "idle") return;
    setState("listening");
    recognitionRef.current.start();
  }, [state]);

  const stop = useCallback(() => {
    if (!recognitionRef.current || state !== "listening") return;
    recognitionRef.current.stop();
  }, [state]);

  const toggle = useCallback(() => {
    if (state === "listening") stop();
    else start();
  }, [state, start, stop]);

  return { state, toggle, start };
}
