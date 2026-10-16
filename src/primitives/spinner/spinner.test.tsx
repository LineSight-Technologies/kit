import * as React from "react";
import { render, screen } from "@testing-library/react";
import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("renders role=status with a default sr-only label", () => {
    render(<Spinner />);
    const el = screen.getByRole("status");
    expect(el).toHaveTextContent("Loading");
    expect(el.querySelector(".sr-only")).toBeInTheDocument();
    expect(el).toHaveClass("animate-ls-spin", "size-4");
    expect(el.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("custom label", () => {
    render(<Spinner label="Optimising schedule" />);
    expect(screen.getByRole("status")).toHaveTextContent("Optimising schedule");
  });

  it.each([
    ["sm", "size-3.5"],
    ["md", "size-4"],
    ["lg", "size-6"],
  ] as const)("size %s", (size, cls) => {
    render(<Spinner size={size} />);
    expect(screen.getByRole("status")).toHaveClass(cls);
  });

  it("className wins and ref forwards", () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} className="size-8 text-accent" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toHaveClass("size-8", "text-accent");
    expect(ref.current).not.toHaveClass("size-4");
  });
});
