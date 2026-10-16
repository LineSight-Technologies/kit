import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatRow, StatTile } from "./stat";

describe("StatTile", () => {
  it("renders label above a tabular value with unit", () => {
    render(<StatTile data-testid="t" label="Scrap rate" value="2.09" unit="%" />);
    const tile = screen.getByTestId("t");
    expect(tile.tagName).toBe("DIV");
    expect(tile).toHaveClass("rounded-lg", "border", "border-line", "bg-surface", "p-4");
    const value = tile.querySelector("[data-numeric]");
    expect(value).toHaveTextContent("2.09");
    expect(value).toHaveClass("text-2xl", "font-semibold", "tabular-nums", "tracking-ls-tight");
    expect(screen.getByText("%")).toHaveClass("text-sm", "text-fg-2");
    expect(screen.getByText("Scrap rate")).toHaveClass("text-xs", "text-fg-2");
  });

  it("renders the delta in its tone with a direction icon", () => {
    const { rerender } = render(<StatTile label="Scrap rate" value="2.09" unit="%" delta={{ value: "−0.4 pt", direction: "down", tone: "success" }} />);
    let delta = document.querySelector("[data-delta]");
    expect(delta).toHaveAttribute("data-delta", "down");
    expect(delta).toHaveClass("text-success");
    expect(delta?.querySelector("svg")).toBeInTheDocument();
    rerender(<StatTile label="Open orders" value="128" delta={{ value: "0", direction: "flat", tone: "neutral" }} />);
    delta = document.querySelector("[data-delta]");
    expect(delta).toHaveAttribute("data-delta", "flat");
    expect(delta).toHaveClass("text-fg-2");
  });

  it("loading renders a skeleton of the same frame and no text", () => {
    render(<StatTile label="Tons slit" value="1,204" loading className="w-40" />);
    expect(screen.queryByText("Tons slit")).not.toBeInTheDocument();
    const skeleton = document.querySelector("[aria-hidden='true']");
    expect(skeleton).toHaveClass("rounded-lg", "border-line", "w-40");
  });

  it("is a link with href, a button with onClick, and hoverable either way", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<StatTile label="Open orders" value="128" href="/orders" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/orders");
    expect(link).toHaveClass("hover:bg-surface-2", "focus-visible:ring-2");
    rerender(<StatTile label="Open orders" value="128" onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("forwards ref and lets className win", () => {
    const ref = React.createRef<HTMLElement>();
    render(<StatTile ref={ref} label="x" value="1" className="p-2" />);
    expect(ref.current).toHaveClass("p-2");
    expect(ref.current).not.toHaveClass("p-4");
  });
});

describe("StatRow", () => {
  it("derives columns from the number of tiles, clamped to 2–4", () => {
    const { rerender } = render(
      <StatRow data-testid="r">
        <StatTile label="a" value="1" />
        <StatTile label="b" value="2" />
        <StatTile label="c" value="3" />
      </StatRow>,
    );
    expect(screen.getByTestId("r")).toHaveAttribute("data-columns", "3");
    expect(screen.getByTestId("r")).toHaveClass("grid", "grid-cols-2", "gap-3", "lg:grid-cols-3");
    rerender(
      <StatRow data-testid="r">
        <StatTile label="a" value="1" />
      </StatRow>,
    );
    expect(screen.getByTestId("r")).toHaveAttribute("data-columns", "2");
    rerender(
      <StatRow data-testid="r" columns={4}>
        <StatTile label="a" value="1" />
        <StatTile label="b" value="2" />
      </StatRow>,
    );
    expect(screen.getByTestId("r")).toHaveClass("lg:grid-cols-4");
  });

  it("warns in development when more than four tiles are given", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <StatRow>
        {Array.from({ length: 5 }, (_, i) => (
          <StatTile key={i} label={`t${i}`} value={i} />
        ))}
      </StatRow>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/limit is four/));
    warn.mockRestore();
  });
});
