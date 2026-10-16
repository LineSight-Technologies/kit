import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Switch } from "./switch";

describe("Switch", () => {
  it("renders unchecked with the md size", () => {
    render(<Switch aria-label="Rush" />);
    const el = screen.getByRole("switch", { name: "Rush" });
    expect(el).toHaveAttribute("data-state", "unchecked");
    expect(el).toHaveClass("h-5", "w-9", "rounded-full", "data-[state=unchecked]:bg-paper-5", "data-[state=checked]:bg-accent");
  });

  it("size sm", () => {
    render(<Switch aria-label="s" size="sm" />);
    expect(screen.getByRole("switch")).toHaveClass("h-4", "w-7");
  });

  it("label toggles and sits right by default", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="Rush order" onCheckedChange={onCheckedChange} />);
    const el = screen.getByRole("switch", { name: "Rush order" });
    await user.click(screen.getByText("Rush order"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(el).toHaveAttribute("data-state", "checked");
    expect(screen.getByText("Rush order")).not.toHaveClass("order-first");
  });

  it("labelPosition left", () => {
    render(<Switch label="Auto-schedule" labelPosition="left" />);
    expect(screen.getByText("Auto-schedule")).toHaveClass("order-first");
  });

  it("thumb translates when checked", () => {
    render(<Switch aria-label="s" checked />);
    const thumb = screen.getByRole("switch").querySelector("span");
    expect(thumb).toHaveClass("bg-surface", "shadow-ls-1", "data-[state=checked]:translate-x-4");
    expect(thumb).toHaveAttribute("data-state", "checked");
  });

  it("disabled, className, ref, keyboard", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLButtonElement>();
    const { rerender } = render(<Switch ref={ref} aria-label="s" className="w-12" />);
    const el = screen.getByRole("switch");
    expect(ref.current).toBe(el);
    expect(el).toHaveClass("w-12");
    expect(el).not.toHaveClass("w-9");
    el.focus();
    await user.keyboard("{Enter}");
    expect(el).toHaveAttribute("data-state", "checked");
    rerender(<Switch ref={ref} aria-label="s" disabled />);
    expect(el).toBeDisabled();
  });
});
