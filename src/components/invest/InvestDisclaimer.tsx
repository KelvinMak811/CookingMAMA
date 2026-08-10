import {
  INVEST_DISCLAIMER_LONG,
  INVEST_DISCLAIMER_SHORT,
} from "@/lib/investMarket";

export function InvestDisclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      className={`invest-disclaimer ${compact ? "invest-disclaimer--compact" : ""}`}
      role="note"
    >
      <strong className="invest-disclaimer-title">{INVEST_DISCLAIMER_SHORT}</strong>
      {!compact && (
        <p className="invest-disclaimer-body mb-0">{INVEST_DISCLAIMER_LONG}</p>
      )}
    </aside>
  );
}
