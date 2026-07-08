"use client";

import { useRouter } from "next/navigation";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { ACCOUNTS, type AccountId } from "@/lib/accounts";
import { syncPullAccount } from "@/lib/cloud-sync";
import { rehydrateAllUserStores } from "@/lib/rehydrate-stores";
import { useAccountStore } from "@/stores/accountStore";

interface CalendarUserButtonsProps {
  className?: string;
  size?: "sm" | "lg";
}

export function CalendarUserButtons({
  className = "w-100",
  size = "sm",
}: CalendarUserButtonsProps) {
  const router = useRouter();
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const setCurrentUser = useAccountStore((s) => s.setCurrentUser);
  const setViewingUser = useAccountStore((s) => s.setViewingUser);

  const openCalendar = async (userId: AccountId) => {
    if (!currentUserId) {
      setCurrentUser(userId);
      await syncPullAccount(userId);
      await rehydrateAllUserStores();
    } else {
      setViewingUser(userId);
      if (userId === currentUserId) {
        await rehydrateAllUserStores();
      } else {
        await syncPullAccount(userId);
      }
    }
    router.push(`/history/?user=${userId}`);
  };

  return (
    <ButtonGroup className={className} aria-label="快速打開煮食日曆">
      {(Object.values(ACCOUNTS) as { id: AccountId; name: string }[]).map((acc) => (
        <Button
          key={acc.id}
          type="button"
          variant="outline-primary"
          size={size}
          className="flex-fill"
          onClick={() => void openCalendar(acc.id)}
        >
          📅 {acc.name}
        </Button>
      ))}
    </ButtonGroup>
  );
}
