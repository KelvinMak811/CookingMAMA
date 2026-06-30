"use client";

import { useShoppingStore } from "@/stores/shoppingStore";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import { formatShoppingSpeech, migrateShoppingItem } from "@/lib/shoppingUtils";

export function ReadUnboughtButton() {
  const getUnboughtItems = useShoppingStore((s) => s.getUnboughtItems);
  const unbought = getUnboughtItems().map(migrateShoppingItem);

  if (unbought.length === 0) return null;

  const texts = [
    `你仲有 ${unbought.length} 樣嘢未買`,
    ...unbought.map((item, i) => `第${i + 1}樣，${formatShoppingSpeech(item)}`),
  ];

  return <VoiceAssistant texts={texts} buttonLabel="播報未買食材" className="w-100" />;
}
