import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip, TooltipContent, TooltipProvider, TooltipRoot, TooltipTrigger } from "./tooltip";

describe("Tooltip", () => {
  it("opens on focus inside a TooltipProvider and shows content", async () => {
    render(
      <TooltipProvider>
        <Tooltip content="Delete coil">
          <button type="button">x</button>
        </Tooltip>
      </TooltipProvider>,
    );
    await userEvent.tab();
    const tip = await screen.findByRole("tooltip");
    expect(tip).toHaveTextContent("Delete coil");
  });

  it("self-provides when no TooltipProvider is mounted", async () => {
    render(
      <Tooltip content="Copy">
        <button type="button">x</button>
      </Tooltip>,
    );
    await userEvent.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Copy");
  });

  it("styles the content with the inverse surface and tooltip layer", () => {
    render(
      <Tooltip content="Edit" defaultOpen>
        <button type="button">x</button>
      </Tooltip>,
    );
    const visible = screen.getAllByText("Edit").map((n) => n.closest("[data-side]")).find(Boolean) as HTMLElement;
    expect(visible).toHaveClass("bg-surface-inverse", "text-fg-inverse", "z-tooltip", "shadow-ls-2", "animate-ls-fade-in");
  });

  it("renders a shortcut as a Kbd", () => {
    render(
      <Tooltip content="Save" shortcut="⌘S" defaultOpen>
        <button type="button">x</button>
      </Tooltip>,
    );
    const kbd = document.querySelector("[data-side] kbd");
    expect(kbd).toHaveTextContent("⌘S");
  });

  it("passes side through", () => {
    render(
      <Tooltip content="Below" side="bottom" defaultOpen>
        <button type="button">x</button>
      </Tooltip>,
    );
    expect(document.querySelector("[data-side]")).toHaveAttribute("data-side", "bottom");
  });

  it("renders the child alone when content is empty", () => {
    const { container } = render(
      <Tooltip content="">
        <button type="button">x</button>
      </Tooltip>,
    );
    expect(container.firstElementChild?.tagName).toBe("BUTTON");
    expect(screen.getByRole("button")).not.toHaveAttribute("data-state");
  });

  it("className merges last on the content", () => {
    render(
      <Tooltip content="Edit" defaultOpen className="bg-surface">
        <button type="button">x</button>
      </Tooltip>,
    );
    const el = document.querySelector("[data-side]") as HTMLElement;
    expect(el).toHaveClass("bg-surface");
    expect(el).not.toHaveClass("bg-surface-inverse");
  });

  it("low-level parts compose", async () => {
    render(
      <TooltipProvider delayDuration={0}>
        <TooltipRoot>
          <TooltipTrigger asChild>
            <button type="button">x</button>
          </TooltipTrigger>
          <TooltipContent>Custom</TooltipContent>
        </TooltipRoot>
      </TooltipProvider>,
    );
    await userEvent.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Custom");
  });
});
