"use client";

import { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import type { RecipeDraft } from "@/lib/recipeDraft";
import { appPath } from "@/lib/paths";

interface InstagramImportCardProps {
  onApplyDraft: (draft: RecipeDraft) => void;
}

export function InstagramImportCard({ onApplyDraft }: InstagramImportCardProps) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(appPath("/api/import-instagram"));
        const json = (await res.json()) as {
          ai?: { hasApiKey?: boolean; provider?: string; model?: string | null };
        };
        if (cancelled) return;
        if (json.ai?.hasApiKey) {
          const tip =
            json.ai.provider === "ai-gateway"
              ? "（Gateway 要綁卡；想免費可加 GROQ_API_KEY）"
              : "";
          setAiStatus(
            `AI 已就緒（${json.ai.provider}${json.ai.model ? ` / ${json.ai.model}` : ""}）${tip}`
          );
        } else {
          setAiStatus(
            "伺服器未偵測到 AI key。免費方案：加 GROQ_API_KEY（console.groq.com），Vercel Redeploy／本機 .env.local 後重開。"
          );
        }
      } catch {
        if (!cancelled) setAiStatus(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleImport = async () => {
    setError(null);
    setNote(null);

    if (!url.trim() && !text.trim()) {
      setError("請貼上 Instagram 連結，或者貼上貼文文字");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(appPath("/api/import-instagram"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim() || undefined,
          text: text.trim() || undefined,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        note?: string;
        draft?: RecipeDraft;
        mode?: string;
        aiError?: string;
      };

      if (!res.ok || !json.ok || !json.draft) {
        setError(json.error || "匯入失敗，請稍後再試");
        if (json.note) setNote(json.note);
        return;
      }

      onApplyDraft(json.draft);
      const filledName = json.draft.name ? `「${json.draft.name}」` : "草稿";
      setNote(
        `${json.note || "已填入下方表單"} → 請向下檢查${filledName}，確認後再撳「加入菜式」。`
      );
      if (json.mode !== "ai" && json.aiError) {
        setError(json.aiError);
      }
    } catch {
      setError("網絡錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm border-start border-4 border-primary">
      <Card.Body>
        <h6 className="fw-bold mb-1">📱 從 Instagram 匯入</h6>
        <p className="small text-secondary mb-2">
          貼上 post／reels 連結，或者直接貼 caption／材料步驟。系統會整理成草稿填入下面表單，你核對後先儲存。
        </p>
        {aiStatus && (
          <p
            className={`small mb-3 ${aiStatus.includes("未偵測") ? "text-danger" : "text-success"}`}
          >
            {aiStatus}
          </p>
        )}

        {/* 唔用巢狀 <form>，避免觸發外層「加入菜式」提交 */}
        <div className="d-flex flex-column gap-3">
          <Form.Group>
            <Form.Label className="small text-secondary mb-1">Instagram 連結</Form.Label>
            <Form.Control
              type="text"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.instagram.com/reel/… 或 /p/…"
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className="small text-secondary mb-1">
              貼文文字（強烈建議貼上；只貼連結好多時會失敗）
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                "例如：\n菜式名稱：菠蘿咕嚕肉\n材料：豬梅頭肉 300克、…\n步驟：\n1. …"
              }
            />
          </Form.Group>

          {error && (
            <Alert variant="warning" className="py-2 mb-0 small">
              {error}
            </Alert>
          )}
          {note && (
            <Alert variant={error ? "light" : "success"} className="py-2 mb-0 small">
              {note}
            </Alert>
          )}

          <Button
            type="button"
            variant="outline-primary"
            disabled={loading}
            onClick={() => void handleImport()}
          >
            {loading ? "整理緊…" : "匯入並填入表單"}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
