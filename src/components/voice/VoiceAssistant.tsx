"use client";

import Button from "react-bootstrap/Button";
import { useSpeech } from "@/hooks/useSpeech";

interface VoiceAssistantProps {
  texts: string[];
  buttonLabel?: string;
  className?: string;
}

export function VoiceAssistant({
  texts,
  buttonLabel = "語音播報",
  className = "",
}: VoiceAssistantProps) {
  const { speakSequence, stop, isSpeaking, isSupported } = useSpeech();
  if (!isSupported || texts.length === 0) return null;

  return (
    <Button
      type="button"
      variant={isSpeaking ? "secondary" : "outline-primary"}
      className={className}
      onClick={() => (isSpeaking ? stop() : speakSequence(texts))}
    >
      {isSpeaking ? "⏹ 停止播報" : `🎙️ ${buttonLabel}`}
    </Button>
  );
}
