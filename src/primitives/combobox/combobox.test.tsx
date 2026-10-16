import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { Field } from "../field/field";
import { Combobox, type ComboboxOption } from "./combobox";

const options: ComboboxOption[] = [
  { value: "c1", label: "Apex Metals", meta: "Houston", keywords: ["apx"] },
  { value: "c2", label: "Blue Ridge Steel", meta: "Roanoke" },
  { value: "c3", label: "Cascade Coil", disabled: true },
];

function Single(props: Partial<React.ComponentProps<typeof Combobox>>) {
  const [value, setValue] = useState<string | null>(null);
  return <Combobox options={options} value={value} onChange={setValue} aria-label="Customer" {...(props as object)} />;
}

function Multi(props: Partial<React.ComponentProps<typeof Combobox>>) {
  const [value, setValue] = useState<string[]>(["c1", "c2"]);
  return <Combobox multiple options={options} value={value} onChange={setValue} aria-label="Customers" {...(props as object)} />;
}

describe("Combobox", () => {
  it("renders a trigger with placeholder and control chrome", () => {
    render(<Combobox options={options} placeholder="Pick a customer" aria-label="Customer" />);
    const trigger = screen.getByRole("combobox", { name: "Customer" });
    expect(trigger).toHaveTextContent("Pick a customer");
    expect(trigger).toHaveClass("h-control", "rounded-md", "border-line");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it.each([
    ["sm", "h-control-sm"],
    ["lg", "h-control-lg"],
  ] as const)("size %s", (size, cls) => {
    render(<Combobox size={size} options={options} aria-label="c" />);
    expect(screen.getByRole("combobox")).toHaveClass(cls);
  });

  it("opens, filters, selects and closes (single)", async () => {
    const user = userEvent.setup();
    render(<Single />);
    const trigger = screen.getByRole("combobox", { name: "Customer" });
    await user.click(trigger);
    const search = await screen.findByPlaceholderText("Search…");
    expect(screen.getAllByRole("option")).toHaveLength(3);
    await user.type(search, "apx");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    await user.click(screen.getByRole("option", { name: /Apex Metals/ }));
    await waitFor(() => expect(screen.queryByPlaceholderText("Search…")).toBeNull());
    expect(trigger).toHaveTextContent("Apex Metals");
  });

  it("shows empty text", async () => {
    const user = userEvent.setup();
    render(<Single emptyText="Nothing" />);
    await user.click(screen.getByRole("combobox"));
    await user.type(await screen.findByPlaceholderText("Search…"), "zzz");
    expect(await screen.findByText("Nothing")).toBeInTheDocument();
  });

  it("keyboard: ArrowDown opens, Enter selects the highlighted item", async () => {
    const user = userEvent.setup();
    render(<Single />);
    const trigger = screen.getByRole("combobox");
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    await screen.findByPlaceholderText("Search…");
    await user.keyboard("{ArrowDown}{Enter}");
    await waitFor(() => expect(trigger).toHaveTextContent("Blue Ridge Steel"));
  });

  it("multiple: renders chips, removes one, collapses overflow", async () => {
    const user = userEvent.setup();
    render(<Multi maxChips={1} />);
    const trigger = screen.getByRole("combobox", { name: "Customers" });
    expect(trigger).toHaveTextContent("Apex Metals");
    expect(trigger).toHaveTextContent("+1");
    await user.click(screen.getByRole("button", { name: "Remove Apex Metals" }));
    expect(trigger).not.toHaveTextContent("Apex Metals");
    expect(trigger).toHaveTextContent("Blue Ridge Steel");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("multiple: selecting keeps the list open and toggles", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox multiple options={options} value={["c1"]} onChange={onChange} aria-label="c" />);
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: /Blue Ridge/ }));
    expect(onChange).toHaveBeenCalledWith(["c1", "c2"]);
    expect(screen.getByPlaceholderText("Search…")).toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: /Apex/ }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("clearable shows a clear button", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox options={options} value="c1" onChange={onChange} clearable aria-label="c" />);
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("onCreate offers a create row", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    render(<Single onCreate={onCreate} />);
    await user.click(screen.getByRole("combobox"));
    await user.type(await screen.findByPlaceholderText("Search…"), "Delta Tube");
    await user.click(await screen.findByRole("option", { name: /Create “Delta Tube”/ }));
    expect(onCreate).toHaveBeenCalledWith("Delta Tube");
  });

  it("onSearch is debounced", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSearch = vi.fn();
    render(<Single onSearch={onSearch} />);
    await user.click(screen.getByRole("combobox"));
    await act(async () => {
      vi.advanceTimersByTime(0);
    });
    expect(onSearch).toHaveBeenCalledWith("");
    await user.type(screen.getByPlaceholderText("Search…"), "ap");
    expect(onSearch).toHaveBeenCalledTimes(1);
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    expect(onSearch).toHaveBeenLastCalledWith("ap");
    vi.useRealTimers();
  });

  it("loading shows a spinner instead of options", async () => {
    const user = userEvent.setup();
    render(<Single loading />);
    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByLabelText("Loading")).toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("disabled, invalid, className, ref, hidden input", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Combobox ref={ref} options={options} value="c1" disabled aria-invalid className="w-64" name="customer" aria-label="c" />);
    const trigger = screen.getByRole("combobox");
    expect(ref.current).toBe(trigger);
    expect(trigger).toHaveAttribute("aria-disabled", "true");
    expect(trigger).toHaveAttribute("tabindex", "-1");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveClass("w-64");
    expect(trigger.querySelector('input[name="customer"]')).toHaveValue("c1");
  });

  it("takes id and error wiring from Field", () => {
    render(
      <Field label="Customer" error="Pick one">
        <Combobox options={options} />
      </Field>,
    );
    const trigger = screen.getByRole("combobox", { name: /Customer/ });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("aria-describedby", screen.getByRole("alert").id);
  });
});
