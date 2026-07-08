"use client";

import { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import { AppLink } from "@/components/layout/AppLink";
import { ACCOUNTS, getAccountName, type AccountId } from "@/lib/accounts";
import { useAccountStore } from "@/stores/accountStore";

export function AccountMenu() {
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const [open, setOpen] = useState(false);

  if (!currentUserId) {
    return (
      <AppLink href="/account/" className="btn btn-outline-primary btn-sm">
        帳戶
      </AppLink>
    );
  }

  const user = ACCOUNTS[currentUserId];

  return (
    <Dropdown align="end" show={open} onToggle={setOpen}>
      <Dropdown.Toggle
        variant="outline-primary"
        size="sm"
        id="account-menu-toggle"
        className="account-menu-toggle"
      >
        {user.name}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.ItemText className="text-secondary small">
          已登入：{user.name}
        </Dropdown.ItemText>
        <Dropdown.Divider />
        <Dropdown.Item href="/account/">切換帳戶</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export function AccountDisplayName() {
  const currentUserId = useAccountStore((s) => s.currentUserId);
  if (!currentUserId) return <>帳戶</>;
  return <>{getAccountName(currentUserId)}</>;
}
