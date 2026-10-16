import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { RadioCard, RadioCards, RadioGroup, RadioGroupItem } from "./radio-group";

describe("RadioGroup", () => {
  it("renders radios with labels and selects on click", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup onValueChange={onValueChange} aria-label="Priority">
        <RadioGroupItem value="std" label="Standard" />
        <RadioGroupItem value="rush" label="Rush" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radiogroup", { name: "Priority" })).toBeInTheDocument();
    const rush = screen.getByRole("radio", { name: "Rush" });
    expect(rush).toHaveClass("rounded-full", "size-4");
    await user.click(screen.getByText("Rush"));
    expect(onValueChange).toHaveBeenCalledWith("rush");
    expect(rush).toHaveAttribute("data-state", "checked");
  });

  it("arrow keys move selection", async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup defaultValue="a" aria-label="g">
        <RadioGroupItem value="a" label="A" />
        <RadioGroupItem value="b" label="B" />
      </RadioGroup>,
    );
    screen.getByRole("radio", { name: "A" }).focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "B" })).toHaveAttribute("data-state", "checked");
  });

  it("horizontal orientation, disabled item, className, ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <RadioGroup ref={ref} orientation="horizontal" className="gap-8" aria-label="g">
        <RadioGroupItem value="a" label="A" disabled />
      </RadioGroup>,
    );
    expect(ref.current).toHaveClass("flex-row", "gap-8");
    expect(ref.current).not.toHaveClass("gap-2");
    expect(screen.getByRole("radio")).toBeDisabled();
  });
});

describe("RadioCards", () => {
  const options = [
    { value: "ltl", title: "LTL freight", meta: "$412" },
    { value: "ftl", title: "Full truckload", meta: "$1,180" },
    { value: "pickup", title: "Customer pickup", disabled: true },
  ];

  it("renders one card per option with title and meta", () => {
    render(<RadioCards options={options} aria-label="Shipping" />);
    const cards = screen.getAllByRole("radio");
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveClass("rounded-lg", "border-line", "data-[state=checked]:border-accent", "data-[state=checked]:bg-accent-soft");
    expect(screen.getByText("$412")).toBeInTheDocument();
    expect(cards[2]).toBeDisabled();
  });

  it("selects a card and reflects checked state", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<RadioCards options={options} onValueChange={onValueChange} aria-label="Shipping" />);
    await user.click(screen.getByRole("radio", { name: /Full truckload/ }));
    expect(onValueChange).toHaveBeenCalledWith("ftl");
    expect(screen.getByRole("radio", { name: /Full truckload/ })).toHaveAttribute("data-state", "checked");
  });

  it("accepts RadioCard children and columns", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <RadioCards ref={ref} columns={2} aria-label="g">
        <RadioCard value="a" title="A" />
        <RadioCard value="b" title="B" meta={<span>meta</span>} />
      </RadioCards>,
    );
    expect(ref.current).toHaveClass("grid-cols-2");
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });
});
