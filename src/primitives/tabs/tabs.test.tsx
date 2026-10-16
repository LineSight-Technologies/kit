import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

function Demo(props: { variant?: "underline" | "pill" }) {
  return (
    <Tabs defaultValue="orders">
      <TabsList variant={props.variant} data-testid="list">
        <TabsTrigger value="orders" count={12}>
          Orders
        </TabsTrigger>
        <TabsTrigger value="coils">Coils</TabsTrigger>
        <TabsTrigger value="history" disabled>
          History
        </TabsTrigger>
      </TabsList>
      <TabsContent value="orders">Open orders</TabsContent>
      <TabsContent value="coils">Coils in stock</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("renders a tablist with the default tab active and its panel visible", () => {
    render(<Demo />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Orders/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Open orders")).toBeInTheDocument();
    expect(screen.queryByText("Coils in stock")).not.toBeInTheDocument();
  });

  it("underline is the default variant and flows to triggers", () => {
    render(<Demo />);
    expect(screen.getByTestId("list")).toHaveClass("border-b", "gap-4");
    expect(screen.getByTestId("list")).toHaveAttribute("data-variant", "underline");
    expect(screen.getByRole("tab", { name: /Orders/ })).toHaveClass("border-b-2", "data-[state=active]:border-accent");
  });

  it("pill variant styles list and triggers", () => {
    render(<Demo variant="pill" />);
    expect(screen.getByTestId("list")).toHaveClass("bg-surface-3", "p-1", "rounded-md");
    expect(screen.getByRole("tab", { name: /Orders/ })).toHaveClass("rounded-sm", "data-[state=active]:bg-surface");
  });

  it("renders a tabular count", () => {
    render(<Demo />);
    const count = screen.getByRole("tab", { name: /Orders/ }).querySelector("[data-count]");
    expect(count).toHaveTextContent("12");
    expect(count).toHaveClass("tabular-nums", "text-fg-3");
  });

  it("switches with click and arrow keys, skipping disabled", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole("tab", { name: "Coils" }));
    expect(screen.getByText("Coils in stock")).toBeInTheDocument();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Orders/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "History" })).toBeDisabled();
  });

  it("className wins and ref forwards", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Tabs defaultValue="a">
        <TabsList ref={ref} className="gap-8">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a" className="mt-8" data-testid="panel">
          A
        </TabsContent>
      </Tabs>,
    );
    expect(ref.current).toHaveClass("gap-8");
    expect(ref.current).not.toHaveClass("gap-4");
    expect(screen.getByTestId("panel")).toHaveClass("mt-8");
    expect(screen.getByTestId("panel")).not.toHaveClass("mt-4");
  });
});
