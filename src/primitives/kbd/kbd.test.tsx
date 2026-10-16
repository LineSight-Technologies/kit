import * as React from "react";
import { render, screen } from "@testing-library/react";
import { Kbd, KbdGroup } from "./kbd";

describe("Kbd", () => {
  it("renders a <kbd> chip", () => {
    render(<Kbd>⌘K</Kbd>);
    const el = screen.getByText("⌘K");
    expect(el.tagName).toBe("KBD");
    expect(el).toHaveClass("border-line", "font-sans", "text-xs", "tabular-nums", "rounded-sm");
  });

  it("className wins and ref forwards", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <Kbd ref={ref} className="bg-surface">
        Esc
      </Kbd>,
    );
    expect(ref.current?.tagName).toBe("KBD");
    expect(ref.current).toHaveClass("bg-surface");
    expect(ref.current).not.toHaveClass("bg-surface-2");
  });

  it("KbdGroup lays keys out in a row", () => {
    render(
      <KbdGroup data-testid="g">
        <Kbd>G</Kbd>
        <Kbd>O</Kbd>
      </KbdGroup>,
    );
    const g = screen.getByTestId("g");
    expect(g).toHaveClass("inline-flex", "gap-1");
    expect(g.querySelectorAll("kbd")).toHaveLength(2);
  });
});
