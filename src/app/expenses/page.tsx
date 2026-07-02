"use client";

import { useMemo, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { AppShell } from "@/components/layout/AppShell";
import { ExpenseMonthNav } from "@/components/expenses/ExpenseMonthNav";
import { ExpenseSummary } from "@/components/expenses/ExpenseSummary";
import { ExpensePieChart } from "@/components/expenses/ExpensePieChart";
import { ExpenseLedger } from "@/components/expenses/ExpenseLedger";
import { useShoppingStore } from "@/stores/shoppingStore";
import { useCookingLogStore } from "@/stores/cookingLogStore";
import {
  computeMonthStats,
  groupExpensesByDay,
  monthlyMealChart,
  spendingByRecipe,
} from "@/lib/expenses";

export default function ExpensesPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const items = useShoppingStore((s) => s.items);
  const records = useCookingLogStore((s) => s.records);

  const stats = useMemo(
    () => computeMonthStats(items, records, year, month),
    [items, records, year, month]
  );
  const ledger = useMemo(
    () => groupExpensesByDay(items, year, month),
    [items, year, month, items]
  );
  const recipeChart = useMemo(
    () => spendingByRecipe(items, year, month),
    [items, year, month, items]
  );
  const mealChart = useMemo(
    () => monthlyMealChart(records, year),
    [records, year]
  );

  return (
    <AppShell title="開支紀錄">
      <ExpenseMonthNav
        year={year}
        month={month}
        onChange={(y, m) => {
          setYear(y);
          setMonth(m);
        }}
      />

      <ExpenseSummary stats={stats} year={year} month={month} />

      <Row className="g-3 mb-4">
        <Col md={6}>
          <ExpensePieChart
            title="本月開支分佈（按菜式）"
            slices={recipeChart}
            emptyText="本月未記錄材料價錢"
          />
        </Col>
        <Col md={6}>
          <ExpensePieChart
            title={`${year}年每月煮食餐數`}
            slices={mealChart}
            emptyText="未有任何煮食紀錄"
          />
        </Col>
      </Row>

      <h2 className="h6 fw-bold mb-3">每日開支明細</h2>
      <ExpenseLedger groups={ledger} />
    </AppShell>
  );
}
