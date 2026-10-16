import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Boxes } from "lucide-react";
import { EmptyState, ErrorState } from "./empty-state";

describe("EmptyState", () => {
  it("renders icon, title and one action, centred, md by default", () => {
    render(<EmptyState data-testid="e" icon={<Boxes />} title="No coils in this bay" action={<button type="button">Receive coil</button>} />);
    const el = screen.getByTestId("e");
    expect(el).toHaveClass("flex-col", "items-center", "text-center", "py-16");
    expect(el).toHaveAttribute("data-size", "md");
    expect(el.querySelector("svg")).toBeInTheDocument();
    expect(el.querySelector("svg")?.parentElement).toHaveClass("size-10", "rounded-md", "bg-surface-3");
    expect(screen.getByText("No coils in this bay")).toHaveClass("text-sm", "font-medium");
    expect(screen.getByRole("button", { name: "Receive coil" })).toBeInTheDocument();
  });

  it("sm is tighter for panels; className wins; ref forwards", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<EmptyState ref={ref} size="sm" title="No results" className="py-2" />);
    expect(ref.current).toHaveAttribute("data-size", "sm");
    expect(ref.current).toHaveClass("py-2");
    expect(ref.current).not.toHaveClass("py-8");
    expect(ref.current?.querySelector("svg")).toBeNull();
  });
});

describe("ErrorState", () => {
  it("is an alert with a default title and a retry action", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Something went wrong");
    expect(alert.querySelector("svg")?.parentElement).toHaveClass("bg-danger-soft", "text-danger");
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows the message only for an Error with one", () => {
    const { rerender, container } = render(<ErrorState title="Could not load orders" error={new Error("ECONNRESET")} />);
    expect(screen.getByText("ECONNRESET")).toHaveClass("text-xs", "text-fg-2");
    rerender(<ErrorState error="plain string" />);
    expect(container.querySelector("[data-error-message]")).toBeNull();
    rerender(<ErrorState error={new Error("")} />);
    expect(container.querySelector("[data-error-message]")).toBeNull();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("supports size sm", () => {
    render(<ErrorState size="sm" />);
    expect(screen.getByRole("alert")).toHaveClass("py-8");
  });
});
