export const ACCOUNTS = {
  kelvin: { id: "kelvin", name: "Kelvin" },
  yuetsum: { id: "yuetsum", name: "YuetSum" },
} as const;

export type AccountId = keyof typeof ACCOUNTS;

export function isAccountId(id: string | null | undefined): id is AccountId {
  return id === "kelvin" || id === "yuetsum";
}

export function getAccountName(userId: string): string {
  return ACCOUNTS[userId as AccountId]?.name ?? userId;
}

export function getOtherUserId(userId: AccountId): AccountId | null {
  const other = (Object.keys(ACCOUNTS) as AccountId[]).find((id) => id !== userId);
  return other ?? null;
}
