"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseSpeechOptions {
  lang?: string;
  rate?: number;
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const { lang = "zh-HK", rate = 0.9 } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" && "speechSynthesis" in window
    );
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) return;

      stop();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, lang, rate, stop]
  );

  const speakSequence = useCallback(
    async (texts: string[], pauseMs = 800) => {
      for (let i = 0; i < texts.length; i++) {
        speak(texts[i]);
        await new Promise<void>((resolve) => {
          const check = setInterval(() => {
            if (!window.speechSynthesis.speaking) {
              clearInterval(check);
              resolve();
            }
          }, 100);
        });
        if (i < texts.length - 1) {
          await new Promise((r) => setTimeout(r, pauseMs));
        }
      }
    },
    [speak]
  );

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { speak, speakSequence, stop, isSpeaking, isSupported };
}
