import { render, screen } from "@testing-library/react";
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

  it("sets an explicit height between min and max rows", () => {
    render(<Textarea aria-label="n" minRows={2} maxRows={4} />);
    const el = screen.getByLabelText("n") as HTMLTextAreaElement;
    // jsdom reports 0 scrollHeight, so the floor applies: 2 rows * 20px + 16px padding + 2px border.
    expect(el.style.height).toBe("58px");
    expect(el.style.overflowY).toBe("hidden");
  });

  it("caps at maxRows and scrolls past it", () => {
    render(<Textarea aria-label="n" minRows={1} maxRows={2} />);
    const el = screen.getByLabelText("n") as HTMLTextAreaElement;
    Object.defineProperty(el, "scrollHeight", { configurable: true, value: 400 });
    el.focus();
    // Trigger the fit via a change.
    el.value = "a";
    el.dispatchEvent(new Event("input", { bubbles: true }));
    expect(el.style.height).toBe("58px");
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
