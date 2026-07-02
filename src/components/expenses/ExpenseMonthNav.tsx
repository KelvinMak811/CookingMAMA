"use client";

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

interface ExpenseMonthNavProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export function ExpenseMonthNav({ year, month, onChange }: ExpenseMonthNavProps) {
  const prev = () => {
    const d = new Date(year, month - 1, 1);
    onChange(d.getFullYear(), d.getMonth());
  };

  const next = () => {
    const d = new Date(year, month + 1, 1);
    onChange(d.getFullYear(), d.getMonth());
  };

  const today = new Date();
  const isCurrent =
    year === today.getFullYear() && month === today.getMonth();

  return (
    <Card className="border-0 shadow-sm mb-3">
      <Card.Body className="d-flex align-items-center justify-content-between py-2">
        <Button variant="light" size="sm" onClick={prev} aria-label="上個月">
          ‹
        </Button>
        <div className="text-center">
          <div className="fw-bold">
            {year}年{month + 1}月
          </div>
          {isCurrent && <div className="small text-secondary">本月</div>}
        </div>
        <Button
          variant="light"
          size="sm"
          onClick={next}
          aria-label="下個月"
          disabled={isCurrent}
        >
          ›
        </Button>
      </Card.Body>
    </Card>
  );
}
