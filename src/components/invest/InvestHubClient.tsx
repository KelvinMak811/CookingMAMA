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
    desc: "市場結構、落盤基礎、費用意識同風險框架。",
  },
  {
    href: "/invest/markets",
    kicker: "Markets",
    title: "港股＋美股走勢",
    desc: "指數同代表性股份嘅示範快照，附分類說明。",
  },
  {
    href: "/invest/ideas",
    kicker: "Ideas",
    title: "學習想法同倉位",
    desc: "透明示範引擎：論點、風險、紙上倉位、離場清單。",
  },
  {
    href: "/invest/watchlist",
    kicker: "Practice",
    title: "觀察名單＋紙上組合",
    desc: "虛擬現金練習買賣，資料跟帳戶分開儲存。",
  },
  {
    href: "/invest/plan",
    kicker: "Plan",
    title: "學習日程",
    desc: "按每週日數同每日分鐘數生成溫習表。",
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
