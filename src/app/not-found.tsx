import Link from "next/link";
import Button from "react-bootstrap/Button";
import { AppShell } from "@/components/layout/AppShell";

export default function NotFound() {
  return (
    <AppShell title="搵唔到">
      <div className="text-center py-5">
        <div className="fs-1 mb-3">😕</div>
        <h2 className="h5">呢個頁面唔存在</h2>
        <p className="text-secondary mb-4">可能個菜式已經刪除或者連結有誤</p>
        <Link href="/recipes">
          <Button variant="primary">返回菜式庫</Button>
        </Link>
      </div>
    </AppShell>
  );
}
