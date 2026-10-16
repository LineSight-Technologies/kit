import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Package, Search } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandMenu, useCommandMenu } from "./command-menu";

const groups = (onSelect: (id: string) => void) => [
  {
    heading: "Navigate",
    items: [
      { id: "orders", label: "Orders", icon: <Package />, shortcut: "G O", onSelect: () => onSelect("orders") },
      { id: "coils", label: "Coils", onSelect: () => onSelect("coils"), meta: "Inventory" },
    ],
  },
  {
    heading: "Actions",
    items: [{ id: "new-order", label: "New order", keywords: ["create"], onSelect: () => onSelect("new-order") }],
  },
];

describe("CommandMenu", () => {
  it("renders groups, items, shortcuts and meta when open", () => {
    render(<CommandMenu open onOpenChange={() => {}} groups={groups(() => {})} />);
    expect(screen.getByRole("dialog", { name: "Command menu" })).toBeInTheDocument();
    expect(screen.getByText("Navigate")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Orders/ })).toHaveTextContent("G O");
    expect(screen.getByRole("option", { name: /Coils/ })).toHaveTextContent("Inventory");
  });

  it("filters on typing, including keywords, and shows emptyText", async () => {
    const user = userEvent.setup();
    render(<CommandMenu open onOpenChange={() => {}} groups={groups(() => {})} emptyText="Nothing matches" />);
    const input = screen.getByPlaceholderText("Search or jump to…");
    await user.type(input, "create");
    expect(screen.getByRole("option", { name: /New order/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Coils/ })).not.toBeInTheDocument();
    await user.clear(input);
    await user.type(input, "zzzz");
    expect(screen.getByText("Nothing matches")).toBeInTheDocument();
  });

  it("selects with Enter, calls onSelect and closes", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    render(<CommandMenu open onOpenChange={onOpenChange} groups={groups(onSelect)} />);
    await user.type(screen.getByPlaceholderText("Search or jump to…"), "coil");
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("coils");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("floats recents while the query is empty and dedupes them from their group", async () => {
    const user = userEvent.setup();
    render(<CommandMenu open onOpenChange={() => {}} groups={groups(() => {})} recentIds={["coils"]} />);
    expect(screen.getByText("Recent")).toBeInTheDocument();
    expect(screen.getAllByRole("option", { name: /Coils/ })).toHaveLength(1);
    await user.type(screen.getByPlaceholderText("Search or jump to…"), "c");
    expect(screen.queryByText("Recent")).not.toBeInTheDocument();
  });

  it("shows a loading row and closes on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<CommandMenu open onOpenChange={onOpenChange} groups={[]} loading />);
    expect(screen.getByText("Searching…")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("useCommandMenu", () => {
  function Host() {
    const { open, setOpen } = useCommandMenu();
    return (
      <>
        <span data-testid="state">{open ? "open" : "closed"}</span>
        <button onClick={() => setOpen(false)}>close</button>
      </>
    );
  }
  it("toggles on ⌘K and Ctrl+K", async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.keyboard("{Meta>}k{/Meta}");
    expect(screen.getByTestId("state")).toHaveTextContent("open");
    await user.keyboard("{Control>}k{/Control}");
    expect(screen.getByTestId("state")).toHaveTextContent("closed");
  });
});

describe("Command wrappers", () => {
  it("compose into a listbox with styled rows", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Command ref={ref} className="rounded-lg">
        <CommandInput placeholder="Find a slitter" />
        <CommandList>
          <CommandEmpty>None</CommandEmpty>
          <CommandGroup heading="Slitters">
            <CommandItem value="line-1" className="py-3">
              <Search /> Line 1
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(ref.current).toHaveClass("rounded-lg", "bg-surface");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    const item = screen.getByRole("option", { name: /Line 1/ });
    expect(item).toHaveClass("py-3", "data-[selected=true]:bg-surface-3");
    expect(item).not.toHaveClass("py-1.5");
  });
});
