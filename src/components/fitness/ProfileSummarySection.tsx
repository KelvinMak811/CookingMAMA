"use client";

import Link from "next/link";
import {
  buildProfileSummaryCards,
  type WorkoutProfile,
} from "@/lib/workoutPlanner";

interface ProfileSummarySectionProps {
  profile: WorkoutProfile | null;
  compact?: boolean;
  /** Extra free-text notes from the form (injuries, history, etc.). */
  showNotes?: boolean;
}

export function ProfileSummarySection({
  profile,
  compact = false,
  showNotes = true,
}: ProfileSummarySectionProps) {
  if (!profile) {
    return (
      <section className="planner-output-card mb-3">
        <h2 className="h5 fw-bold mb-2">個人資料 / 計劃依據</h2>
        <p className="small text-secondary mb-3">
          未搵到同呢份計劃關聯嘅身體資料。請返去運動頁更新並重新儲存，之後再打開計劃頁就會顯示。
        </p>
        <Link href="/fitness" className="btn btn-outline-primary btn-sm">
          去更新個人資料
        </Link>
      </section>
    );
  }

  const cards = buildProfileSummaryCards(profile);
  const noteBlocks: { title: string; text: string }[] = [];
  if (showNotes) {
    if (profile.trainingHistory?.trim()) {
      noteBlocks.push({
        title: "運動背景",
        text: profile.trainingHistory.trim(),
      });
    }
    if (profile.injuries?.trim()) {
      noteBlocks.push({ title: "傷患 / 痛症", text: profile.injuries.trim() });
    }
    if (profile.medicalNotes?.trim()) {
      noteBlocks.push({
        title: "健康狀況 / 醫療限制",
        text: profile.medicalNotes.trim(),
      });
    }
    if (profile.notes?.trim()) {
      noteBlocks.push({ title: "額外備註", text: profile.notes.trim() });
    }
  }

  return (
    <section className={compact ? "mb-3" : "planner-output-card mb-3"}>
      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
        <div>
          <h2 className="h5 fw-bold mb-1">個人資料 / 計劃依據</h2>
          <p className="small text-secondary mb-0">
            呢份計劃係根據你填寫嘅身體同訓練資料生成。
          </p>
        </div>
        {!compact ? (
          <Link href="/fitness" className="btn btn-sm btn-outline-secondary">
            修改資料
          </Link>
        ) : null}
      </div>

      <div className="planner-summary-grid mb-0">
        {cards.map((card) => (
          <div key={card.label} className="planner-stat-card">
            <div className="planner-stat-label">{card.label}</div>
            <div className="planner-stat-value">{card.value}</div>
          </div>
        ))}
      </div>

      {noteBlocks.length ? (
        <div className="planner-profile-notes mt-3">
          {noteBlocks.map((block) => (
            <div key={block.title} className="planner-profile-note">
              <div className="planner-stat-label mb-1">{block.title}</div>
              <p className="small mb-0">{block.text}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
