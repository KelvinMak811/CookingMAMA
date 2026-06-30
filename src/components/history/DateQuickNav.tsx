"use client";

import { useMemo } from "react";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Card from "react-bootstrap/Card";
import type { CookingRecord, MealPlan } from "@/types";
import {
  formatDayLabel,
  formatWeekday,
  getDateRange,
  hasAnyOnDate,
  toDateInputValue,
} from "@/lib/dateNav";
import { isSameDay } from "@/lib/utils";

interface DateQuickNavProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  records: CookingRecord[];
  plans: MealPlan[];
}

export function DateQuickNav({
  selectedDate,
  onSelectDate,
  records,
  plans,
}: DateQuickNavProps) {
  const today = new Date();
  const quickDates = useMemo(() => getDateRange(today, 14, 7), []);

  return (
    <Card className="mb-3 border-0 shadow-sm">
      <Card.Body className="py-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="mb-0 fw-bold">📅 揀日子</h6>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary rounded-pill"
              onClick={() => onSelectDate(new Date())}
            >
              今日
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill"
              onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() - 1);
                onSelectDate(d);
              }}
            >
              昨日
            </button>
          </div>
        </div>

        <div className="date-nav-scroll mb-3">
          <Nav variant="pills" className="flex-nowrap gap-2">
            {quickDates.map((date) => {
              const active = isSameDay(date, selectedDate);
              const { hasRecord, hasPlan } = hasAnyOnDate(records, plans, date);
              return (
                <Nav.Item key={toDateInputValue(date)}>
                  <Nav.Link
                    active={active}
                    onClick={() => onSelectDate(date)}
                    className="rounded-3 px-3 py-2 text-center"
                    style={{ minWidth: "4.5rem", cursor: "pointer" }}
                  >
                    <div className="small opacity-75">{formatWeekday(date)}</div>
                    <div className="fw-semibold">{formatDayLabel(date)}</div>
                    {(hasPlan || hasRecord) && (
                      <span className="d-flex justify-content-center gap-1 mt-1">
                        {hasPlan && (
                          <span
                            className={`d-inline-block rounded-circle ${active ? "bg-white" : "bg-info"}`}
                            style={{ width: 6, height: 6 }}
                          />
                        )}
                        {hasRecord && (
                          <span
                            className={`d-inline-block rounded-circle ${active ? "bg-white" : "bg-success"}`}
                            style={{ width: 6, height: 6 }}
                          />
                        )}
                      </span>
                    )}
                  </Nav.Link>
                </Nav.Item>
              );
            })}
          </Nav>
        </div>

        <Form.Group>
          <Form.Label className="small text-secondary mb-1">跳去指定日期</Form.Label>
          <Form.Control
            type="date"
            value={toDateInputValue(selectedDate)}
            onChange={(e) => {
              if (e.target.value) {
                const [y, m, d] = e.target.value.split("-").map(Number);
                onSelectDate(new Date(y, m - 1, d));
              }
            }}
          />
        </Form.Group>
      </Card.Body>
    </Card>
  );
}
