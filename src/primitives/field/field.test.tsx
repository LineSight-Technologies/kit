import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { Field, FieldError, Label, useFieldContext } from "./field";
import { Input } from "../input/input";

function Probe() {
  const ctx = useFieldContext();
  return <span data-testid="probe">{ctx ? `${ctx.id}|${ctx.errorId ?? ""}|${ctx.invalid}|${ctx.required}` : "none"}</span>;
}

describe("Label", () => {
  it("renders text and a required mark", () => {
    render(<Label required>Width</Label>);
    expect(screen.getByText("Width")).toBeInTheDocument();
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });

  it("optional renders nothing extra", () => {
    const { container } = render(<Label optional>Notes</Label>);
    expect(container.textContent).toBe("Notes");
  });

  it("merges className last and forwards ref", () => {
    const ref = createRef<HTMLLabelElement>();
    render(<Label ref={ref} className="text-fg-2">x</Label>);
    expect(ref.current).toHaveClass("text-fg-2");
    expect(ref.current).not.toHaveClass("text-fg");
  });
});

describe("Field", () => {
  it("wires a kit control through context", () => {
    render(
      <Field label="Gauge" error="Required" required>
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText(/Gauge/);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toBeRequired();
    const err = screen.getByRole("alert");
    expect(err).toHaveTextContent("Required");
    expect(err).toHaveClass("text-danger");
    expect(input.getAttribute("aria-describedby")).toBe(err.id);
  });

  it("uses htmlFor when provided", () => {
    render(
      <Field label="Customer" htmlFor="cust">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("Customer")).toHaveAttribute("id", "cust");
  });

  it("clones id/aria onto a bare DOM control", () => {
    render(
      <Field label="Width" error="Too wide">
        <input />
      </Field>,
    );
    const input = screen.getByLabelText("Width");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby");
  });

  it("exposes context values", () => {
    render(
      <Field label="L" htmlFor="f1" error="bad" required>
        <Probe />
      </Field>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("f1|f1-error|true|true");
  });

  it("renders no error element without error", () => {
    render(
      <Field label="L">
        <Input />
      </Field>,
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("horizontal orientation sets the grid", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Field ref={ref} label="L" orientation="horizontal">
        <Input />
      </Field>,
    );
    expect(ref.current).toHaveAttribute("data-orientation", "horizontal");
    expect(ref.current?.className).toContain("grid-cols-[10rem_minmax(0,1fr)]");
  });

  it("FieldError standalone renders nothing when empty", () => {
    const { container } = render(<FieldError />);
    expect(container).toBeEmptyDOMElement();
  });
});
