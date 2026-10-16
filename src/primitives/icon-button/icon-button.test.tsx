import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Trash2 } from "lucide-react";
import { IconButton } from "./icon-button";
import { TooltipProvider } from "../tooltip/tooltip";

describe("IconButton", () => {
  it("uses label as the accessible name and defaults to ghost / md", () => {
    render(
      <IconButton label="Delete coil">
        <Trash2 />
      </IconButton>,
    );
    const btn = screen.getByRole("button", { name: "Delete coil" });
    expect(btn).toHaveAttribute("aria-label", "Delete coil");
    expect(btn).toHaveClass("size-9", "hover:bg-surface-3");
  });

  it.each([
    ["primary", "bg-accent"],
    ["secondary", "bg-surface-3"],
    ["outline", "border-line"],
    ["danger", "bg-danger"],
  ] as const)("applies the %s variant", (variant, cls) => {
    render(
      <IconButton label="x" variant={variant}>
        <Trash2 />
      </IconButton>,
    );
    expect(screen.getByRole("button")).toHaveClass(cls);
  });

  it.each([
    ["sm", "size-8"],
    ["md", "size-9"],
    ["lg", "size-10"],
  ] as const)("applies size %s", (size, cls) => {
    render(
      <IconButton label="x" size={size}>
        <Trash2 />
      </IconButton>,
    );
    expect(screen.getByRole("button")).toHaveClass(cls);
  });

  it("className wins and ref forwards", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <IconButton ref={ref} label="x" className="size-12">
        <Trash2 />
      </IconButton>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveClass("size-12");
    expect(ref.current).not.toHaveClass("size-9");
  });

  it("shows the label as a tooltip on focus", async () => {
    render(
      <TooltipProvider>
        <IconButton label="Delete coil">
          <Trash2 />
        </IconButton>
      </TooltipProvider>,
    );
    await userEvent.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Delete coil");
  });

  it("works without a TooltipProvider in the tree", async () => {
    render(
      <IconButton label="Edit">
        <Trash2 />
      </IconButton>,
    );
    await userEvent.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Edit");
  });

  it("tooltip={false} renders no tooltip", async () => {
    render(
      <IconButton label="Edit" tooltip={false}>
        <Trash2 />
      </IconButton>,
    );
    await userEvent.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("loading swaps the icon for a spinner and disables", () => {
    const { container } = render(
      <IconButton label="Save" loading>
        <Trash2 data-testid="icon" />
      </IconButton>,
    );
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
    expect(container.querySelector('[role="status"]')).toBeInTheDocument();
  });

  it("asChild applies classes and label to the child", () => {
    render(
      <IconButton label="Open order" asChild tooltip={false}>
        <a href="/orders/1">
          <Trash2 />
        </a>
      </IconButton>,
    );
    const link = screen.getByRole("link", { name: "Open order" });
    expect(link).toHaveClass("size-9");
  });
});
