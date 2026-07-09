import { Suspense } from "react";
import { HistoryPageClient } from "@/app/history/HistoryPageClient";

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="container py-4 text-secondary">載入中…</div>}>
      <HistoryPageClient />
    </Suspense>
  );
}
