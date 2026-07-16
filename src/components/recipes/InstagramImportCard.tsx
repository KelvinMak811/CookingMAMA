"use client";

import { FormEvent, useState } from "react";
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

  const handleImport = async (event: FormEvent) => {
    event.preventDefault();
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
        needsCaption?: boolean;
      };

      if (!res.ok || !json.ok || !json.draft) {
        setError(json.error || "匯入失敗，請稍後再試");
        if (json.note) setNote(json.note);
        return;
      }

      onApplyDraft(json.draft);
      setNote(json.note || "已填入表單，請核對後再儲存。");
      setText("");
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
        <p className="small text-secondary mb-3">
          貼上 post／reels 連結，或者直接貼 caption／材料步驟。系統會整理成草稿，你核對後先儲存。
        </p>

        <Form onSubmit={handleImport} className="d-flex flex-column gap-3">
          <Form.Group>
            <Form.Label className="small text-secondary mb-1">Instagram 連結</Form.Label>
            <Form.Control
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.instagram.com/reel/… 或 /p/…"
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className="small text-secondary mb-1">
              貼文文字（建議貼上；IG 好多時讀唔到完整內容）
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"例如：\n菜式名稱：菠蘿咕嚕肉\n材料：豬梅頭肉 300克、…\n步驟：\n1. …"}
            />
          </Form.Group>

          {error && (
            <Alert variant="warning" className="py-2 mb-0 small">
              {error}
            </Alert>
          )}
          {note && !error && (
            <Alert variant="success" className="py-2 mb-0 small">
              {note}
            </Alert>
          )}

          <Button type="submit" variant="outline-primary" disabled={loading}>
            {loading ? "整理緊…" : "匯入並填入表單"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
