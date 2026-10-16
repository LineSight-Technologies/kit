import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Field } from "../field/field";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("renders an unchecked checkbox", () => {
    render(<Checkbox aria-label="Rush" />);
    const box = screen.getByRole("checkbox", { name: "Rush" });
    expect(box).toHaveAttribute("data-state", "unchecked");
    expect(box).toHaveClass("size-4", "rounded-sm");
  });

  it("label toggles the box and gets a generated id", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Include scrap" onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole("checkbox", { name: "Include scrap" });
    expect(box.id).toBeTruthy();
    await user.click(screen.getByText("Include scrap"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(box).toHaveAttribute("data-state", "checked");
  });

  it("checked applies accent classes", () => {
    render(<Checkbox aria-label="c" checked />);
    const box = screen.getByRole("checkbox");
    expect(box).toHaveAttribute("data-state", "checked");
    expect(box).toHaveClass("data-[state=checked]:bg-accent", "data-[state=checked]:border-accent");
  });

  it("indeterminate renders a minus", () => {
    render(<Checkbox aria-label="c" indeterminate />);
    const box = screen.getByRole("checkbox");
    expect(box).toHaveAttribute("data-state", "indeterminate");
    expect(box).toHaveAttribute("aria-checked", "mixed");
    expect(box.querySelector("svg.lucide-minus")).toBeInTheDocument();
  });

  it("size sm", () => {
    render(<Checkbox aria-label="c" size="sm" />);
    expect(screen.getByRole("checkbox")).toHaveClass("size-3.5");
  });

  it("disabled, className, ref, keyboard", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLButtonElement>();
    render(<Checkbox ref={ref} aria-label="c" className="size-6" />);
    const box = screen.getByRole("checkbox");
    expect(ref.current).toBe(box);
    expect(box).toHaveClass("size-6");
    expect(box).not.toHaveClass("size-4");
    box.focus();
    await user.keyboard(" ");
    expect(box).toHaveAttribute("data-state", "checked");
  });

  it("disabled", () => {
    render(<Checkbox aria-label="c" disabled label="Off" />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("takes id and invalid from Field", () => {
    render(
      <Field label="Accept" error="Required">
        <Checkbox />
      </Field>,
    );
    const box = screen.getByRole("checkbox", { name: /Accept/ });
    expect(box).toHaveAttribute("aria-invalid", "true");
  });
});
