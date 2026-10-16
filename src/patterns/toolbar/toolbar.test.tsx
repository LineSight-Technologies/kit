import * as React from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LayoutGrid, List } from "lucide-react";
import { BulkBar, FilterChip, FilterMenu, SearchInput, Toolbar, ViewToggle } from "./toolbar";

function Search(props: Partial<React.ComponentProps<typeof SearchInput>>) {
  const [value, setValue] = React.useState(props.value ?? "");
  return <SearchInput {...props} value={value} onChange={(v) => { setValue(v); props.onChange?.(v); }} />;
}

describe("Toolbar", () => {
  it("places slots and only renders the applied-filter row when given", () => {
    const { rerender } = render(
      <Toolbar data-testid="t" search={<span>search</span>} filters={<span>filters</span>} view={<span>view</span>} actions={<button type="button">New order</button>} />,
    );
    const t = screen.getByTestId("t");
    expect(t).toHaveClass("flex", "flex-col", "gap-2");
    expect(within(t).getByText("search")).toBeInTheDocument();
    expect(within(t).getByRole("button", { name: "New order" }).parentElement).toHaveClass("ml-auto");
    expect(t.querySelector("[data-active-filters]")).toBeNull();
    rerender(<Toolbar data-testid="t" active={<span>Status: Open</span>} />);
    expect(t.querySelector("[data-active-filters]")).toHaveTextContent("Status: Open");
  });
});

describe("SearchInput", () => {
  it("is a searchbox with a leading icon, and clears from the trailing control", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Search onChange={onChange} />);
    const box = screen.getByRole("searchbox");
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
    await user.type(box, "C-104");
    expect(onChange).toHaveBeenLastCalledWith("C-104");
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(box).toHaveFocus();
  });

  it("debounces onDebouncedChange and never fires it on mount", async () => {
    vi.useFakeTimers();
    try {
      const debounced = vi.fn();
      function Controlled() {
        const [v, setV] = React.useState("");
        return (
          <>
            <SearchInput value={v} onChange={setV} onDebouncedChange={debounced} />
            <button type="button" onClick={() => setV("hdg")}>set</button>
          </>
        );
      }
      render(<Controlled />);
      act(() => vi.advanceTimersByTime(500));
      expect(debounced).not.toHaveBeenCalled();
      act(() => screen.getByRole("button", { name: "set" }).click());
      act(() => vi.advanceTimersByTime(249));
      expect(debounced).not.toHaveBeenCalled();
      act(() => vi.advanceTimersByTime(1));
      expect(debounced).toHaveBeenCalledWith("hdg");
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows the / key while empty and focuses on / from outside an input", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Search shortcut />
        <textarea aria-label="notes" />
      </>,
    );
    expect(screen.getByText("/")).toBeInTheDocument();
    await user.keyboard("/");
    expect(screen.getByRole("searchbox")).toHaveFocus();
    await user.click(screen.getByLabelText("notes"));
    await user.keyboard("/");
    expect(screen.getByLabelText("notes")).toHaveValue("/");
  });

  it("forwards the ref to the input and lets className win on the wrapper", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<SearchInput ref={ref} value="" onChange={() => {}} className="w-40" />);
    expect(ref.current).toBe(screen.getByRole("searchbox"));
    expect(ref.current?.parentElement).toHaveClass("w-40");
    expect(ref.current?.parentElement).not.toHaveClass("w-full");
  });
});

describe("FilterChip", () => {
  it("renders label and value, with the active look when a value is applied", () => {
    const { rerender } = render(<FilterChip label="Status" />);
    const chip = screen.getByRole("button", { name: "Status" });
    expect(chip).toHaveClass("rounded-full", "border-line", "h-control-sm");
    expect(chip).not.toHaveAttribute("data-active");
    rerender(<FilterChip label="Status" value="Open" />);
    const applied = screen.getByRole("button", { name: "Status: Open" });
    expect(applied).toHaveClass("border-accent", "bg-accent-soft");
    expect(within(applied).getByText("Open")).toHaveClass("font-medium");
  });

  it("onRemove adds a remove control without nesting buttons", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onClick = vi.fn();
    render(<FilterChip label="Gauge" value="0.0598 in" onRemove={onRemove} onClick={onClick} />);
    const remove = screen.getByRole("button", { name: "Remove Gauge" });
    expect(remove.closest("button")?.parentElement?.closest("button")).toBeNull();
    await user.click(remove);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Gauge: 0.0598 in" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("supports asChild, disabled and ref", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <>
        <FilterChip asChild label="Mill">
          <a href="/mills" />
        </FilterChip>
        <FilterChip ref={ref} label="Product" disabled />
      </>,
    );
    expect(screen.getByRole("link", { name: "Mill" })).toHaveAttribute("href", "/mills");
    expect(screen.getByRole("button", { name: "Product" })).toBeDisabled();
    expect(ref.current).toBe(screen.getByRole("button", { name: "Product" }));
  });
});

describe("FilterMenu", () => {
  it("opens a popover from the chip, closes on Escape, and clears an applied value", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const { rerender } = render(
      <FilterMenu label="Status">
        <p>Pick a status</p>
      </FilterMenu>,
    );
    await user.click(screen.getByRole("button", { name: "Status" }));
    expect(await screen.findByText("Pick a status")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveClass("w-64");
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Pick a status")).not.toBeInTheDocument();
    rerender(
      <FilterMenu label="Status" value="Open" onClear={onClear}>
        <p>Pick a status</p>
      </FilterMenu>,
    );
    expect(screen.getByRole("button", { name: "Status: Open" }).parentElement).toHaveClass("bg-accent-soft", "border-accent");
    await user.click(screen.getByRole("button", { name: "Remove Status" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

describe("ViewToggle", () => {
  it("is a group of pressed buttons", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ViewToggle
        value="table"
        onChange={onChange}
        options={[
          { value: "table", icon: <List />, label: "Table" },
          { value: "grid", icon: <LayoutGrid />, label: "Grid" },
        ]}
      />,
    );
    const group = screen.getByRole("group", { name: "View" });
    expect(group).toHaveClass("bg-surface-3", "p-0.5", "rounded-md");
    const table = screen.getByRole("button", { name: "Table" });
    expect(table).toHaveAttribute("aria-pressed", "true");
    expect(table).toHaveClass("bg-surface", "shadow-ls-1");
    const grid = screen.getByRole("button", { name: "Grid" });
    expect(grid).toHaveAttribute("aria-pressed", "false");
    await user.click(grid);
    expect(onChange).toHaveBeenCalledWith("grid");
  });
});

describe("BulkBar", () => {
  it("renders nothing at zero and a floating dark bar with count, actions and clear otherwise", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const { rerender, container } = render(<BulkBar count={0} onClear={onClear} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<BulkBar count={3} onClear={onClear} actions={<button type="button">Release</button>} />);
    const bar = screen.getByRole("region", { name: "Selection" });
    expect(bar).toHaveClass("sticky", "bottom-4", "bg-surface-inverse", "text-fg-inverse", "shadow-ls-3", "animate-ls-slide-in-up");
    expect(bar).toHaveTextContent("3 selected");
    expect(within(bar).getByRole("button", { name: "Release" })).toBeInTheDocument();
    await user.click(within(bar).getByRole("button", { name: "Clear selection" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
