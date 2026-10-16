import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Search } from "lucide-react";
import { Input } from "./input";

describe("Input", () => {
  it("renders a textbox with md height by default", () => {
    render(<Input placeholder="Coil ID" />);
    const el = screen.getByPlaceholderText("Coil ID");
    expect(el).toHaveClass("h-control", "rounded-md", "border-line");
  });

  it.each([
    ["sm", "h-control-sm"],
    ["md", "h-control"],
    ["lg", "h-control-lg"],
  ] as const)("size %s applies %s", (size, cls) => {
    render(<Input size={size} aria-label="w" />);
    expect(screen.getByLabelText("w")).toHaveClass(cls);
  });

  it("className wins and ref forwards", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} className="h-10" aria-label="w" />);
    expect(ref.current).toBe(screen.getByLabelText("w"));
    expect(ref.current).toHaveClass("h-10");
    expect(ref.current).not.toHaveClass("h-control");
  });

  it("invalid + disabled states", () => {
    render(<Input aria-label="w" aria-invalid disabled />);
    const el = screen.getByLabelText("w");
    expect(el).toHaveAttribute("aria-invalid", "true");
    expect(el).toBeDisabled();
    expect(el).toHaveClass("aria-invalid:border-danger", "disabled:opacity-50");
  });

  it("number type sets decimal inputMode and tabular nums", () => {
    render(<Input type="number" aria-label="g" />);
    const el = screen.getByLabelText("g");
    expect(el).toHaveAttribute("inputmode", "decimal");
    expect(el).toHaveClass("tabular-nums");
  });

  it("renders slots inside the chrome and moves state onto the wrapper", () => {
    render(<Input aria-label="g" trailing="in" leading={<Search data-testid="icon" />} aria-invalid disabled />);
    const el = screen.getByLabelText("g");
    const wrapper = el.parentElement!;
    expect(wrapper).toHaveClass("border-line", "h-control");
    expect(wrapper).toHaveAttribute("data-invalid", "true");
    expect(wrapper).toHaveAttribute("data-disabled", "true");
    expect(screen.getByText("in")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(el).not.toHaveClass("border-line");
  });

  it("types", async () => {
    const user = userEvent.setup();
    render(<Input aria-label="w" />);
    await user.type(screen.getByLabelText("w"), "48.5");
    expect(screen.getByLabelText("w")).toHaveValue("48.5");
  });
});
