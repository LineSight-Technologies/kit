import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Field } from "../field/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SimpleSelect } from "./select";

const options = [
  { value: "hrpo", label: "HRPO" },
  { value: "cr", label: "Cold rolled" },
  { value: "hdg", label: "Galvanized", disabled: true },
];

describe("Select", () => {
  it("renders a trigger with placeholder and control chrome", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Product type">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole("combobox", { name: "Product type" });
    expect(trigger).toHaveClass("h-control", "rounded-md", "border-line");
    expect(trigger).toHaveTextContent("Pick one");
  });

  it.each([
    ["sm", "h-control-sm"],
    ["lg", "h-control-lg"],
  ] as const)("size %s", (size, cls) => {
    render(<SimpleSelect size={size} options={options} aria-label="s" />);
    expect(screen.getByRole("combobox", { name: "s" })).toHaveClass(cls);
  });

  it("opens with the keyboard, lists items, selects one", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SimpleSelect options={options} placeholder="Type" onValueChange={onValueChange} aria-label="s" />);
    const trigger = screen.getByRole("combobox", { name: "s" });
    trigger.focus();
    await user.keyboard("{Enter}");
    const listbox = await screen.findByRole("listbox");
    expect(listbox).toHaveClass("z-dropdown", "shadow-ls-2", "rounded-lg");
    const items = screen.getAllByRole("option");
    expect(items).toHaveLength(3);
    expect(items[2]).toHaveAttribute("data-disabled");
    fireEvent.pointerUp(screen.getByRole("option", { name: "Cold rolled" }), { button: 0, ctrlKey: false, pointerType: "mouse" });
    expect(onValueChange).toHaveBeenCalledWith("cr");
  });

  it("shows the selected label", () => {
    render(<SimpleSelect options={options} value="hrpo" aria-label="s" />);
    expect(screen.getByRole("combobox", { name: "s" })).toHaveTextContent("HRPO");
  });

  it("disabled, invalid, className, ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<SimpleSelect ref={ref} options={options} disabled aria-invalid className="w-40" aria-label="s" />);
    const trigger = screen.getByRole("combobox", { name: "s" });
    expect(ref.current).toBe(trigger);
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveClass("w-40");
  });

  it("picks up id and error from Field", () => {
    render(
      <Field label="Product type" error="Choose one">
        <SimpleSelect options={options} />
      </Field>,
    );
    const trigger = screen.getByRole("combobox", { name: /Product type/ });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("aria-describedby", screen.getByRole("alert").id);
  });
});
