"use client";

import { AppLink } from "@/components/layout/AppLink";
import { AccountMenu } from "@/components/account/AccountMenu";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export function Header({ title, showBack, backHref = "/recipes" }: HeaderProps) {
  return (
    <Navbar
      bg="white"
      expand="md"
      className="border-bottom sticky-top shadow-sm app-navbar"
    >
      <Container className="app-main px-3 py-0">
        <div className="d-flex align-items-center w-100 gap-2 app-navbar-inner">
          {showBack ? (
            <>
              <AppLink href={backHref} className="btn btn-light btn-sm rounded-3 flex-shrink-0" aria-label="返回">
                ←
              </AppLink>
              {title && (
                <span className="mb-0 fw-bold text-truncate flex-grow-1 min-w-0">{title}</span>
              )}
            </>
          ) : (
            <AppLink
              href="/recipes"
              className="d-flex align-items-center gap-2 text-decoration-none min-w-0 flex-grow-1"
            >
              <span className="app-navbar-icon">🍳</span>
              {title ? (
                <span className="fw-bold text-dark text-truncate">{title}</span>
              ) : (
                <span className="fw-bold text-primary">SmartCook</span>
              )}
            </AppLink>
          )}
          <div className="ms-auto flex-shrink-0">
            <AccountMenu />
          </div>
        </div>
      </Container>
    </Navbar>
  );
}
