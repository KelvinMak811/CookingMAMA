import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import type { CookingRecord } from "@/types";
import { formatDate } from "@/lib/utils";

interface CookingRecordCardProps {
  record: CookingRecord;
  onRemove?: (id: string) => void;
}

export function CookingRecordCard({ record, onRemove }: CookingRecordCardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="d-flex align-items-start gap-3 py-3">
        <div
          className="rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 40, height: 40 }}
        >
          🍽️
        </div>
        <div className="flex-grow-1 min-w-0">
          <h6 className="mb-1 fw-semibold">{record.recipeName}</h6>
          <p className="mb-1 small text-secondary">{formatDate(record.cookedDate)}</p>
          {record.rating && (
            <div>
              {Array.from({ length: record.rating }, (_, i) => (
                <span key={i} className="text-warning small">
                  ★
                </span>
              ))}
            </div>
          )}
        </div>
        {onRemove && (
          <Button
            variant="link"
            className="text-secondary p-0"
            onClick={() => onRemove(record.id)}
            aria-label="刪除紀錄"
          >
            ✕
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}
