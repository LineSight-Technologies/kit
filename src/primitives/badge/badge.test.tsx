import * as React from "react";
import { render, screen } from "@testing-library/react";
import { Badge, StatusBadge, getStatus, normaliseStatus, registerStatus, titleCaseStatus } from "./badge";

describe("Badge", () => {
  it("renders soft neutral md by default", () => {
    render(<Badge>HDG</Badge>);
    const el = screen.getByText("HDG");
    expect(el).toHaveClass("bg-neutral-soft", "text-fg-2", "h-6", "rounded-full");
  });

  it.each([
    ["soft", "success", "bg-success-soft"],
    ["solid", "success", "bg-success"],
    ["outline", "success", "border-current"],
    ["outline", "neutral", "border-line-strong"],
    ["soft", "accent", "bg-accent-soft"],
    ["solid", "danger", "bg-danger"],
    ["soft", "info", "bg-info-soft"],
    ["soft", "warn", "bg-warn-soft"],
  ] as const)("variant=%s tone=%s applies %s", (variant, tone, cls) => {
    render(
      <Badge variant={variant} tone={tone}>
        x
      </Badge>,
    );
    expect(screen.getByText("x")).toHaveClass(cls);
  });

  it("applies size sm", () => {
    render(<Badge size="sm">x</Badge>);
    expect(screen.getByText("x")).toHaveClass("h-5");
  });

  it("renders a leading dot when asked", () => {
    const { container } = render(<Badge dot>Open</Badge>);
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).toHaveClass("bg-current", "rounded-full");
  });

  it("className wins and ref forwards", () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <Badge ref={ref} className="bg-surface">
        x
      </Badge>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toHaveClass("bg-surface");
    expect(ref.current).not.toHaveClass("bg-neutral-soft");
  });

  it("asChild renders the child with badge classes", () => {
    render(
      <Badge asChild tone="info">
        <a href="/orders?status=open">Open</a>
      </Badge>,
    );
    expect(screen.getByRole("link", { name: "Open" })).toHaveClass("bg-info-soft");
  });
});

describe("status registry", () => {
  it("normalises keys", () => {
    expect(normaliseStatus(" In Progress ")).toBe("in_progress");
    expect(normaliseStatus("on-hold")).toBe("on_hold");
    expect(normaliseStatus("ON_HOLD")).toBe("on_hold");
  });

  it("title-cases", () => {
    expect(titleCaseStatus("in_progress")).toBe("In Progress");
    expect(titleCaseStatus("awaiting-qc")).toBe("Awaiting Qc");
  });

  it.each([
    ["open", "info"],
    ["in_progress", "accent"],
    ["Completed", "success"],
    ["on hold", "warn"],
    ["CANCELLED", "danger"],
    ["archived", "neutral"],
  ] as const)("%s → %s", (status, tone) => {
    expect(getStatus(status).tone).toBe(tone);
  });

  it("falls back to neutral with the raw text title-cased", () => {
    expect(getStatus("awaiting_qc")).toEqual({ tone: "neutral", label: "Awaiting Qc" });
  });

  it("registerStatus adds and overrides, with normalised keys", () => {
    registerStatus({ "Awaiting QC": { tone: "warn", label: "Awaiting QC" }, draft: { tone: "neutral" } });
    expect(getStatus("awaiting_qc")).toEqual({ tone: "warn", label: "Awaiting QC" });
    expect(getStatus("draft").tone).toBe("neutral");
    registerStatus({ draft: { tone: "warn" } });
  });
});

describe("StatusBadge", () => {
  it("maps a status to tone and label, with a dot and data-status", () => {
    render(<StatusBadge status="in-progress" />);
    const el = screen.getByText("In Progress");
    expect(el).toHaveClass("bg-accent-soft");
    expect(el).toHaveAttribute("data-status", "in_progress");
    expect(el.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it("accepts variant and size", () => {
    render(<StatusBadge status="shipped" variant="solid" size="sm" dot={false} />);
    const el = screen.getByText("Shipped");
    expect(el).toHaveClass("bg-success", "h-5");
    expect(el.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
  });

  it("unknown status renders neutral", () => {
    render(<StatusBadge status="re-slit requested" />);
    expect(screen.getByText("Re Slit Requested")).toHaveClass("bg-neutral-soft");
  });
});
