"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAccountName } from "@/lib/accounts";
import { useAccountStore } from "@/stores/accountStore";
import { countLessons, trackProgress } from "@/lib/investCourse";
import { loadInvestData } from "@/lib/investStorage";
import { InvestDisclaimer } from "@/components/invest/InvestDisclaimer";

const HUB_LINKS = [
  {
    href: "/invest/learn",
    kicker: "Learn",
    title: "港股／美股入門",
    desc: "完整課堂：概念、例子、風險、小測驗；可開課堂詳情頁。",
  },
  {
    href: "/invest/markets",
    kicker: "Markets",
    title: "實際市場追蹤",
    desc: "指數同觀察標的報價；有 API 就盡量即時，否則標示示範資料。",
  },
  {
    href: "/invest/simulate",
    kicker: "Simulate",
    title: "模擬投資",
    desc: "虛擬現金買賣、持倉盈虧、成交紀錄——清楚標示模擬／學習用。",
  },
  {
    href: "/invest/ideas",
    kicker: "Ideas",
    title: "學習想法同倉位",
    desc: "透明示範引擎：論點、風險、紙上倉位、離場清單。",
  },
  {
    href: "/invest/watchlist",
    kicker: "Watch",
    title: "觀察名單",
    desc: "追蹤想跟進嘅標的；買賣請去模擬投資頁。",
  },
  {
    href: "/invest/plan",
    kicker: "Plan",
    title: "學習日程",
    desc: "按每週日數同每日分鐘數生成溫習表，連去課堂。",
  },
] as const;

export function InvestHubClient() {
  const currentUserId = useAccountStore((s) => s.currentUserId);
  const userKey = currentUserId || "guest";
  const name = currentUserId ? getAccountName(currentUserId) : "訪客";
  const [done, setDone] = useState(0);
  const [watchCount, setWatchCount] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const data = loadInvestData(userKey);
    const track = data.preferences?.defaultTrack ?? "hk_basics";
    const prog = trackProgress(track, data.courseProgress);
    setDone(prog.done);
    setWatchCount(data.watchlist.length);
    setHydrated(true);
  }, [userKey]);

  return (
    <div className="planner-side-stack">
      <InvestDisclaimer />

      <section className="planner-section">
        <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
          <div>
            <h2 className="h5 fw-bold mb-1">你好，{name}</h2>
            <p className="small text-secondary mb-0">
              SmartInvest 資料以帳戶分隔（Kelvin／YuetSum）。而家帳戶進度：
              {hydrated
                ? ` 已完成 ${done}/${countLessons()} 課 · 觀察名單 ${watchCount} 隻`
                : " 載入中…"}
            </p>
          </div>
          <Link href="/invest/plan" className="btn btn-primary btn-sm align-self-start">
            生成學習日程
          </Link>
        </div>
      </section>

      <div className="row g-3">
        {HUB_LINKS.map((item) => (
          <div key={item.href} className="col-12 col-md-6">
            <Link
              href={item.href}
              className="mode-card text-decoration-none text-dark d-block h-100"
            >
              <div className="mode-card-kicker">{item.kicker}</div>
              <h3 className="h5 fw-bold mb-2">{item.title}</h3>
              <p className="text-secondary small mb-0">{item.desc}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
