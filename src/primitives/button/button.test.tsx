import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Plus } from "lucide-react";
import { Button } from "./button";

describe("Button", () => {
  it("renders a type=button with the primary variant by default", () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveClass("bg-accent", "h-control");
  });

  it.each([
    ["secondary", "bg-surface-3"],
    ["outline", "border-line"],
    ["ghost", "hover:bg-surface-3"],
    ["danger", "bg-danger"],
    ["link", "underline-offset-4"],
  ] as const)("applies the %s variant", (variant, cls) => {
    render(<Button variant={variant}>Go</Button>);
    expect(screen.getByRole("button")).toHaveClass(cls);
  });

  it("link has no control height", () => {
    render(<Button variant="link">Open order</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("h-auto", "px-0");
    expect(btn).not.toHaveClass("h-control");
    expect(btn).not.toHaveClass("px-3.5");
  });

  it.each([
    ["sm", "h-control-sm"],
    ["md", "h-control"],
    ["lg", "h-control-lg"],
  ] as const)("applies size %s", (size, cls) => {
    render(<Button size={size}>Go</Button>);
    expect(screen.getByRole("button")).toHaveClass(cls);
  });

  it("fullWidth stretches", () => {
    render(<Button fullWidth>Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("w-full");
  });

  it("className wins over variant classes", () => {
    render(<Button className="bg-surface">Go</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("bg-surface");
    expect(btn).not.toHaveClass("bg-accent");
  });

  it("forwards the ref", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Go</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("renders leading and trailing icons aria-hidden", () => {
    const { container } = render(
      <Button leadingIcon={<Plus data-testid="lead" />} trailingIcon={<Plus data-testid="trail" />}>
        New order
      </Button>,
    );
    expect(screen.getByTestId("lead").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("trail").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });

  it("loading disables, sets aria-busy and shows a spinner in the icon slot", () => {
    render(
      <Button loading leadingIcon={<Plus data-testid="lead" />}>
        Saving
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByTestId("lead")).not.toBeInTheDocument();
  });

  it("loading without an icon keeps the label in the layout but hides it", () => {
    render(<Button loading>Generate schedule</Button>);
    const label = screen.getByText("Generate schedule");
    expect(label).toHaveClass("invisible");
    expect(screen.getByRole("status")).toHaveClass("absolute");
  });

  it("does not fire onClick while disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("is keyboard operable", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("asChild renders the child element with button classes", () => {
    render(
      <Button asChild variant="outline">
        <a href="/orders/1">View order</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "View order" });
    expect(link).toHaveClass("border-line", "rounded-md");
    expect(link).toHaveAttribute("href", "/orders/1");
  });
});
