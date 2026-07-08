"use client";

import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import Alert from "react-bootstrap/Alert";
import { ACCOUNTS, getAccountName, type AccountId } from "@/lib/accounts";
import { syncPullAccount } from "@/lib/cloud-sync";
import { rehydrateAllUserStores } from "@/lib/rehydrate-stores";
import { useAccountStore } from "@/stores/accountStore";

interface UserToggleProps {
  viewingUserId: AccountId;
  onChange: (userId: AccountId) => void;
}

export function UserToggle({ viewingUserId, onChange }: UserToggleProps) {
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const readOnly = viewingUserId !== currentUserId;

  const handleChange = async (userId: AccountId) => {
    onChange(userId);
    await syncPullAccount(userId);
    if (userId === currentUserId) {
      await rehydrateAllUserStores();
    }
  };

  return (
    <div className="mb-3">
      <ButtonGroup className="w-100 user-toggle" aria-label="揀選要睇邊個帳戶嘅紀錄">
        {(Object.values(ACCOUNTS) as { id: AccountId; name: string }[]).map((acc) => (
          <ToggleButton
            key={acc.id}
            id={`view-user-${acc.id}`}
            type="radio"
            variant="outline-primary"
            name="view-user"
            value={acc.id}
            checked={viewingUserId === acc.id}
            onChange={() => void handleChange(acc.id)}
            className="flex-fill btn-sm"
          >
            {acc.name}
            {acc.id === currentUserId ? "（我）" : ""}
          </ToggleButton>
        ))}
      </ButtonGroup>
      {readOnly && (
        <Alert variant="info" className="py-2 small mb-0 mt-2">
          只限閱讀 <strong>{getAccountName(viewingUserId)}</strong> 嘅紀錄，唔可以修改
        </Alert>
      )}
    </div>
  );
}
