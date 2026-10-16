import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { List, ListRow } from "./list";

describe("List", () => {
  it("renders rows with hairlines by default and none when divided=false", () => {
    const { rerender } = render(
      <List data-testid="list">
        <ListRow title="SO-8810" />
        <ListRow title="SO-8812" />
      </List>,
    );
    expect(screen.getByRole("list")).toHaveClass("[&>li]:border-b", "[&>li:last-child]:border-b-0");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    rerender(
      <List divided={false} data-testid="list">
        <ListRow title="SO-8810" />
      </List>,
    );
    expect(screen.getByRole("list")).not.toHaveClass("[&>li]:border-b");
  });

  it("loading shows five placeholders; empty shows the fallback", () => {
    const { unmount } = render(<List loading data-testid="list" />);
    expect(screen.getByTestId("list")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByTestId("list").querySelectorAll("li")).toHaveLength(5);
    unmount();
    render(<List empty={<p>No recent orders</p>} />);
    expect(screen.getByText("No recent orders")).toBeInTheDocument();
  });
});

describe("ListRow", () => {
  it("renders leading, title, meta and trailing slots in a static row", () => {
    render(
      <List>
        <ListRow leading={<span data-testid="lead" />} title="C-10422" meta="HDG G90 · 48.000 in" trailing={<span>2h ago</span>} />
      </List>,
    );
    const row = screen.getByText("C-10422").closest("div")!;
    expect(row.closest("li")).toBeInTheDocument();
    expect(row).toHaveClass("min-h-12", "px-3", "gap-3");
    expect(row).not.toHaveClass("cursor-pointer");
    expect(screen.getByTestId("lead")).toBeInTheDocument();
    expect(screen.getByText("HDG G90 · 48.000 in")).toHaveClass("text-xs", "text-fg-2");
    expect(screen.getByText("2h ago")).toBeInTheDocument();
  });

  it("href renders a link with a chevron unless trailing is given", () => {
    const { rerender } = render(
      <List>
        <ListRow title="WO-20931" href="/work-orders/20931" />
      </List>,
    );
    const link = screen.getByRole("link", { name: "WO-20931" });
    expect(link).toHaveAttribute("href", "/work-orders/20931");
    expect(link).toHaveClass("hover:bg-surface-2", "focus-visible:ring-inset");
    expect(link.querySelector("svg")).toBeInTheDocument();
    rerender(
      <List>
        <ListRow title="WO-20931" href="/work-orders/20931" trailing={<span>Due Fri</span>} />
      </List>,
    );
    expect(screen.getByRole("link").querySelector("svg")).not.toBeInTheDocument();
  });

  it("onClick renders a button; selected rows are tinted and current", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <List>
        <ListRow title="Line 2" onClick={onClick} selected />
      </List>,
    );
    const button = screen.getByRole("button", { name: "Line 2" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("bg-accent-soft");
    expect(button).toHaveAttribute("aria-current", "true");
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("asChild renders the child as the row surface with the slots inside", () => {
    render(
      <List>
        <ListRow asChild title="Customers" meta="42">
          <a href="/customers" data-testid="child" />
        </ListRow>
      </List>,
    );
    const child = screen.getByTestId("child");
    expect(child.tagName).toBe("A");
    expect(child).toHaveClass("min-h-12", "hover:bg-surface-2");
    expect(child).toHaveTextContent("Customers");
    expect(child).toHaveTextContent("42");
  });

  it("className wins and refs forward to the surface", () => {
    const ref = React.createRef<HTMLElement>();
    const listRef = React.createRef<HTMLUListElement>();
    render(
      <List ref={listRef} className="gap-1">
        <ListRow ref={ref} title="x" className="px-6" itemClassName="pl-2" />
      </List>,
    );
    expect(listRef.current).toHaveClass("gap-1");
    expect(ref.current).toHaveClass("px-6");
    expect(ref.current).not.toHaveClass("px-3");
    expect(ref.current!.parentElement).toHaveClass("pl-2");
  });
});
