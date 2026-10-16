import * as React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field } from "../../primitives/field/field";
import { Input } from "../../primitives/input/input";
import { Form, FormActions, FormRow, FormSection, useFormBusy } from "./form";

function BusyProbe() {
  const busy = useFormBusy();
  return <span data-testid="busy">{String(busy)}</span>;
}

describe("Form", () => {
  it("prevents default, disables native validation and calls onSubmit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent) => {
      expect(e.defaultPrevented).toBe(true);
    });
    render(
      <Form onSubmit={onSubmit} data-testid="form">
        <FormActions submitLabel="Create order" />
      </Form>,
    );
    expect(screen.getByTestId("form")).toHaveAttribute("novalidate");
    await user.click(screen.getByRole("button", { name: "Create order" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("is busy while an async onSubmit is pending", async () => {
    const user = userEvent.setup();
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    render(
      <Form onSubmit={() => pending}>
        <BusyProbe />
        <FormActions submitLabel="Save" onCancel={() => {}} />
      </Form>,
    );
    const submit = screen.getByRole("button", { name: "Save" });
    await user.click(submit);
    expect(screen.getByTestId("busy")).toHaveTextContent("true");
    expect(submit).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    await act(async () => {
      release();
      await pending;
    });
    expect(screen.getByTestId("busy")).toHaveTextContent("false");
    expect(submit).not.toHaveAttribute("aria-busy");
  });

  it("busy prop forces the loading state", () => {
    render(
      <Form busy>
        <FormActions submitLabel="Save" />
      </Form>,
    );
    expect(screen.getByRole("button", { name: /Save/ })).toHaveAttribute("aria-busy", "true");
  });
});

describe("FormSection / FormRow", () => {
  it("renders a titled section with a hairline between sections", () => {
    render(
      <Form>
        <FormSection title="Customer" data-testid="s1">
          <FormRow columns={2} data-testid="row">
            <Field label="Customer">
              <Input />
            </Field>
            <Field label="PO number">
              <Input />
            </Field>
          </FormRow>
        </FormSection>
        <FormSection title="Material" data-testid="s2" />
      </Form>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Customer" })).toHaveClass("text-sm", "font-semibold");
    expect(screen.getByTestId("s2")).toHaveClass("border-t", "border-line", "pt-6", "first:border-t-0");
    expect(screen.getByTestId("row")).toHaveClass("grid", "gap-4", "sm:grid-cols-2");
    expect(screen.getByTestId("row")).toHaveAttribute("data-columns", "2");
  });

  it("FormRow defaults to one column and supports three", () => {
    const { rerender } = render(<FormRow data-testid="row" />);
    expect(screen.getByTestId("row")).toHaveClass("grid-cols-1");
    rerender(<FormRow columns={3} data-testid="row" />);
    expect(screen.getByTestId("row")).toHaveClass("sm:grid-cols-3");
  });
});

describe("FormActions", () => {
  it("renders Cancel then the primary, right-aligned, with extra on the left", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<FormActions submitLabel="Create order" onCancel={onCancel} extra={<span>Draft saved</span>} data-testid="actions" />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual(["Cancel", "Create order"]);
    expect(buttons[0]).toHaveClass("bg-surface-3");
    expect(buttons[1]).toHaveClass("bg-accent");
    expect(buttons[1]).toHaveAttribute("type", "submit");
    expect(screen.getByTestId("actions")).toHaveClass("justify-end");
    expect(screen.getByText("Draft saved").parentElement).toHaveClass("mr-auto");
    await user.click(buttons[0]!);
    expect(onCancel).toHaveBeenCalled();
  });

  it("destructive uses the danger button; sticky pins the bar; disabled disables the primary", () => {
    render(<FormActions submitLabel="Delete order" destructive sticky disabled data-testid="actions" />);
    const primary = screen.getByRole("button", { name: "Delete order" });
    expect(primary).toHaveClass("bg-danger");
    expect(primary).toBeDisabled();
    expect(screen.getByTestId("actions")).toHaveClass("sticky", "bottom-0", "bg-surface-2", "border-t", "-mx-6", "px-6", "py-4");
    expect(screen.getByTestId("actions")).toHaveAttribute("data-sticky");
  });

  it("className wins and refs forward", () => {
    const ref = React.createRef<HTMLDivElement>();
    const formRef = React.createRef<HTMLFormElement>();
    render(
      <Form ref={formRef} className="gap-2">
        <FormActions ref={ref} submitLabel="Save" className="justify-start" />
      </Form>,
    );
    expect(formRef.current).toHaveClass("gap-2");
    expect(formRef.current).not.toHaveClass("gap-6");
    expect(ref.current).toHaveClass("justify-start");
    expect(ref.current).not.toHaveClass("justify-end");
  });
});
