"use client";

import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import type { DayExpenseGroup } from "@/lib/expenses";
import { formatCurrency } from "@/lib/utils";

interface ExpenseLedgerProps {
  groups: DayExpenseGroup[];
}

export function ExpenseLedger({ groups }: ExpenseLedgerProps) {
  if (groups.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="text-center text-secondary py-5">
          <div className="fs-2 mb-2">💰</div>
          <p className="mb-1">本月暫時冇開支紀錄</p>
          <p className="small mb-0">
            喺買餸清單勾選已購買，並填寫每樣材料嘅價錢就會自動記錄
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {groups.map((group) => (
        <Card key={group.dateKey} className="border-0 shadow-sm">
          <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center py-3">
            <span className="fw-bold">{group.label}</span>
            <span className="text-primary fw-bold">{formatCurrency(group.total)}</span>
          </Card.Header>
          <Card.Body className="pt-0">
            {group.items.map((item) => (
              <div
                key={item.id}
                className="d-flex justify-content-between align-items-start gap-2 py-2 border-bottom"
              >
                <div className="min-w-0">
                  <div className="fw-medium">
                    {item.name}
                    {item.amount && (
                      <span className="text-secondary fw-normal"> · {item.amount}</span>
                    )}
                  </div>
                  {item.recipeName && (
                    <Badge bg="light" text="secondary" className="fw-normal mt-1">
                      {item.recipeName}
                    </Badge>
                  )}
                </div>
                <span className="text-secondary flex-shrink-0">
                  {formatCurrency(item.price)}
                </span>
              </div>
            ))}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
