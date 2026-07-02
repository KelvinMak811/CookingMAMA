"use client";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import type { MonthExpenseStats } from "@/lib/expenses";
import { formatCurrency } from "@/lib/utils";

interface ExpenseSummaryProps {
  stats: MonthExpenseStats;
  year: number;
  month: number;
}

export function ExpenseSummary({ stats, year, month }: ExpenseSummaryProps) {
  return (
    <>
      <p className="text-secondary small mb-3">
        {year}年{month + 1}月煮食開支總覽 — 數據來自買餸清單已購買項目
      </p>
      <Row className="g-2 mb-4">
        <Col xs={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="py-3">
              <div className="small text-secondary">本月總開支</div>
              <div className="fs-5 fw-bold text-primary">
                {formatCurrency(stats.totalSpend)}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="py-3">
              <div className="small text-secondary">本月煮咗</div>
              <div className="fs-5 fw-bold">{stats.mealCount} 餐</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="py-3">
              <div className="small text-secondary">平均每餐材料費</div>
              <div className="fs-6 fw-bold">
                {stats.mealCount > 0 ? formatCurrency(stats.avgPerMeal) : "—"}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="py-3">
              <div className="small text-secondary">有買餸日子</div>
              <div className="fs-6 fw-bold">{stats.dayCount} 日</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12}>
          <Card className="border-0 bg-primary-subtle">
            <Card.Body className="py-3 d-flex justify-content-between flex-wrap gap-2">
              <span className="small">
                每月平均煮 <strong>{stats.avgMealsPerMonth.toFixed(1)}</strong> 餐
              </span>
              <span className="small">
                每月平均開支 <strong>{formatCurrency(stats.avgSpendPerMonth)}</strong>
              </span>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}
