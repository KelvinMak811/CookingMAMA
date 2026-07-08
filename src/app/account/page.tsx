"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { ACCOUNTS, type AccountId } from "@/lib/accounts";
import { syncPullAccount } from "@/lib/cloud-sync";
import { exportUserBackup, importUserBackup } from "@/lib/cloud-sync";
import { rehydrateAllUserStores } from "@/lib/rehydrate-stores";
import { useAccountStore } from "@/stores/accountStore";

export default function AccountPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const setCurrentUser = useAccountStore((s) => s.setCurrentUser);

  const handlePick = async (userId: AccountId) => {
    setCurrentUser(userId);
    await syncPullAccount(userId);
    await rehydrateAllUserStores();
    router.replace("/recipes/");
  };

  const handleImport = async (file: File) => {
    await importUserBackup(file);
    await rehydrateAllUserStores();
    alert("備份已還原！");
  };

  return (
    <div className="d-flex flex-column min-vh-100 account-page">
      <main className="container app-main flex-grow-1 px-3 py-4">
        <div className="text-center mb-4">
          <div className="fs-1 mb-3">👋</div>
          <h1 className="h4 fw-bold mb-2">揀選帳戶</h1>
          <p className="text-secondary small mb-0">
            唔使密碼，揀你嘅名字就可以保存自己嘅煮食紀錄
          </p>
          {currentUserId && (
            <p className="text-primary small mt-2 mb-0">
              目前登入：{ACCOUNTS[currentUserId].name}
            </p>
          )}
        </div>

        <div className="d-grid gap-3 account-pick-grid mx-auto" style={{ maxWidth: 360 }}>
          {(Object.values(ACCOUNTS) as { id: AccountId; name: string }[]).map((acc) => (
            <Button
              key={acc.id}
              type="button"
              size="lg"
              variant="outline-primary"
              className="account-pick-btn d-flex align-items-center gap-3 justify-content-center py-3"
              onClick={() => handlePick(acc.id)}
            >
              <span
                className="account-pick-avatar rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40 }}
              >
                {acc.name[0]}
              </span>
              <span className="account-pick-name fw-semibold">{acc.name}</span>
            </Button>
          ))}
        </div>

        <p className="text-secondary small text-center mt-3 mb-0">
          兩個帳戶可以互相睇對方嘅日曆同買餸清單，但唔可以修改
        </p>

        <Card className="border-0 shadow-sm mt-4 mx-auto" style={{ maxWidth: 480 }}>
          <Card.Body>
            <h2 className="h6 fw-bold mb-2">換電腦？備份／還原紀錄</h2>
            <p className="text-secondary small mb-3">
              買餸清單、煮食日曆會自動同步去伺服器。你亦可以手動備份 JSON 檔，喺新電腦還原。
            </p>
            <div className="d-grid gap-2">
              <Button
                type="button"
                variant="outline-primary"
                size="sm"
                onClick={() => exportUserBackup()}
              >
                ⬇️ 匯出備份檔
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                ⬆️ 匯入備份檔
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="d-none"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleImport(file).catch((err) => alert(err.message || "還原失敗"));
                  e.target.value = "";
                }}
              />
            </div>
          </Card.Body>
        </Card>
      </main>
    </div>
  );
}
