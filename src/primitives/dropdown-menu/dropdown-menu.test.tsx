import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pencil, Trash2 } from "lucide-react";
import {
  ActionMenu,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

function Menu(props: { onEdit?: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Coil C-10422</DropdownMenuLabel>
        <DropdownMenuItem icon={<Pencil />} shortcut="E" onSelect={props.onEdit}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive icon={<Trash2 />}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenu", () => {
  it("opens from the trigger and exposes a menu role", async () => {
    const user = userEvent.setup();
    render(<Menu />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
  });

  it("renders icon, shortcut and destructive tone", async () => {
    const user = userEvent.setup();
    render(<Menu />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    const edit = await screen.findByRole("menuitem", { name: /Edit/ });
    expect(edit).toHaveTextContent("E");
    expect(edit.querySelector("svg")).toBeInTheDocument();
    const del = screen.getByRole("menuitem", { name: /Delete/ });
    expect(del).toHaveClass("text-danger", "data-[highlighted]:bg-danger-soft");
    expect(del).toHaveAttribute("data-destructive");
  });

  it("selects with keyboard", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<Menu onEdit={onEdit} />);
    screen.getByRole("button", { name: "Open" }).focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("menu");
    await user.keyboard("{Enter}");
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("checkbox and radio items reflect state", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Show gauge</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="width">
            <DropdownMenuRadioItem value="width">Width</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="weight">Weight</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(await screen.findByRole("menuitemcheckbox", { name: "Show gauge" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: "Width" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: "Weight" })).toHaveAttribute("aria-checked", "false");
    await user.keyboard("{Escape}");
  });

  it("merges className last and forwards ref on content", async () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent ref={ref} className="min-w-64">
          <DropdownMenuItem>One</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const menu = await screen.findByRole("menu");
    expect(ref.current).toBe(menu);
    expect(menu).toHaveClass("min-w-64", "z-dropdown");
    expect(menu).not.toHaveClass("min-w-44");
  });
});

describe("ActionMenu", () => {
  it("renders a default Actions trigger and items from data", async () => {
    const user = userEvent.setup();
    const archive = vi.fn();
    render(
      <ActionMenu
        items={[
          { label: "Archive", onSelect: archive },
          { separator: true },
          { label: "Delete", destructive: true, onSelect: () => {} },
          { label: "Export", disabled: true, onSelect: () => {} },
        ]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Actions" }));
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("separator")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Export" })).toHaveAttribute("aria-disabled", "true");
    await user.click(screen.getByRole("menuitem", { name: "Archive" }));
    expect(archive).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("accepts a custom trigger", async () => {
    const user = userEvent.setup();
    render(<ActionMenu trigger={<button>More</button>} items={[{ label: "One", onSelect: () => {} }]} />);
    await user.click(screen.getByRole("button", { name: "More" }));
    expect(await screen.findByRole("menuitem", { name: "One" })).toBeInTheDocument();
  });
});
