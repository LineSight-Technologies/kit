import * as React from "react";
import { render, screen } from "@testing-library/react";
import { Separator } from "./separator";

describe("Separator", () => {
  it("renders a decorative horizontal hairline by default", () => {
    const { container } = render(<Separator />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("role", "none");
    expect(el).toHaveClass("h-px", "w-full", "bg-line");
  });

  it("vertical orientation", () => {
    const { container } = render(<Separator orientation="vertical" />);
    expect(container.firstElementChild).toHaveClass("w-px", "self-stretch");
  });

  it("non-decorative exposes role=separator", () => {
    render(<Separator decorative={false} orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("renders a centred label between two hairlines", () => {
    const { container } = render(<Separator label="Earlier today" />);
    expect(screen.getByText("Earlier today")).toHaveClass("text-xs", "text-fg-3");
    expect(container.querySelectorAll(".h-px")).toHaveLength(2);
  });

  it("ignores the label when vertical", () => {
    render(<Separator label="x" orientation="vertical" />);
    expect(screen.queryByText("x")).not.toBeInTheDocument();
  });

  it("className wins and ref forwards", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Separator ref={ref} className="bg-line-strong" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current).toHaveClass("bg-line-strong");
    expect(ref.current).not.toHaveClass("bg-line");
  });
});
