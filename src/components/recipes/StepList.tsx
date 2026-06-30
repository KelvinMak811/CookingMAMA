"use client";

import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import { SpeakButton } from "@/components/voice/SpeakButton";

interface StepListProps {
  steps: string[];
}

export function StepList({ steps }: StepListProps) {
  return (
    <ListGroup className="gap-2">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const speechText = `第${stepNumber}步，${step}`;
        return (
          <ListGroup.Item key={index} className="border rounded-3 shadow-sm">
            <div className="d-flex gap-3">
              <Badge bg="primary" pill className="align-self-start">
                {stepNumber}
              </Badge>
              <div className="flex-grow-1">
                <p className="mb-2">{step}</p>
                <SpeakButton text={speechText} label="朗讀步驟" size="sm" />
              </div>
            </div>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}
