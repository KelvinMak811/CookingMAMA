"use client";

import Button from "react-bootstrap/Button";
import { useSpeech } from "@/hooks/useSpeech";

interface SpeakButtonProps {
  text: string;
  label?: string;
  size?: "sm" | "lg";
  variant?: "primary" | "outline-primary" | "secondary";
  className?: string;
}

export function SpeakButton({
  text,
  label = "播放",
  size = "sm",
  variant = "outline-primary",
  className = "",
}: SpeakButtonProps) {
  const { speak, stop, isSpeaking, isSupported } = useSpeech();
  if (!isSupported) return null;

  return (
    <Button
      type="button"
      variant={isSpeaking ? "secondary" : variant}
      size={size}
      className={className}
      onClick={() => (isSpeaking ? stop() : speak(text))}
    >
      {isSpeaking ? "⏹ 停止" : `🔊 ${label}`}
    </Button>
  );
}
