import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renders with minRows and resize off", () => {
    render(<Textarea aria-label="n" />);
    const el = screen.getByLabelText("n");
    expect(el.tagName).toBe("TEXTAREA");
    expect(el).toHaveAttribute("rows", "3");
    expect(el).toHaveClass("resize-none", "rounded-md", "border-line");
  });

  it("resize=true enables the vertical handle", () => {
    render(<Textarea aria-label="n" resize />);
    expect(screen.getByLabelText("n")).toHaveClass("resize-y");
  });

  // jsdom has no Tailwind CSS, so the fit reads the UA defaults (2px padding, 1px border) and the
  // 20px line fallback. Rows in px = rows * 20 + vertical padding + vertical border.
  const rowsPx = (el: HTMLElement, rows: number) => {
    const cs = window.getComputedStyle(el);
    const n = (v: string) => parseFloat(v) || 0;
    return rows * 20 + n(cs.paddingTop) + n(cs.paddingBottom) + n(cs.borderTopWidth) + n(cs.borderBottomWidth);
  };

  it("sets an explicit height at the minRows floor when empty", () => {
    render(<Textarea aria-label="n" minRows={2} maxRows={4} />);
    const el = screen.getByLabelText("n") as HTMLTextAreaElement;
    expect(el.style.height).toBe(`${rowsPx(el, 2)}px`);
    expect(el.style.overflowY).toBe("hidden");
  });

  it("caps at maxRows and scrolls past it", () => {
    render(<Textarea aria-label="n" minRows={1} maxRows={2} />);
    const el = screen.getByLabelText("n") as HTMLTextAreaElement;
    Object.defineProperty(el, "scrollHeight", { configurable: true, value: 400 });
    fireEvent.change(el, { target: { value: "a long note" } });
    expect(el.style.height).toBe(`${rowsPx(el, 2)}px`);
    expect(el.style.overflowY).toBe("auto");
  });

  it("className wins, ref forwards, invalid + disabled", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} aria-label="n" className="px-6" aria-invalid disabled />);
    expect(ref.current).toHaveClass("px-6");
    expect(ref.current).not.toHaveClass("px-3");
    expect(ref.current).toHaveAttribute("aria-invalid", "true");
    expect(ref.current).toBeDisabled();
  });

  it("types and calls onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea aria-label="n" onChange={onChange} />);
    await user.type(screen.getByLabelText("n"), "Hold for QC");
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByLabelText("n")).toHaveValue("Hold for QC");
  });
});
