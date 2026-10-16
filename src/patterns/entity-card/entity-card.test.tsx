import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Avatar } from "../../primitives/avatar/avatar";
import { Badge } from "../../primitives/badge/badge";
import { EntityCard, EntityGrid } from "./entity-card";

describe("EntityCard", () => {
  it("renders media, title, meta, badges and children in a resting card", () => {
    render(
      <EntityCard
        media={<Avatar name="Northfield Metals" shape="square" size="lg" />}
        title="Northfield Metals"
        meta="Toll processor · Gary, IN"
        badges={<Badge tone="success">Active</Badge>}
        data-testid="card"
      >
        <p>12 open orders</p>
      </EntityCard>,
    );
    const card = screen.getByTestId("card");
    expect(card.tagName).toBe("ARTICLE");
    expect(card).toHaveClass("rounded-lg", "border-line", "bg-surface", "shadow-ls-1", "transition-shadow", "duration-150");
    expect(card).not.toHaveClass("hover:shadow-ls-2");
    expect(screen.getByRole("heading", { level: 3, name: "Northfield Metals" })).toBeInTheDocument();
    expect(screen.getByText("NM")).toBeInTheDocument();
    expect(screen.getByText("Toll processor · Gary, IN")).toHaveClass("text-xs", "text-fg-2");
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("12 open orders")).toBeInTheDocument();
  });

  it("cover media renders in a 4:3 slot above the body", () => {
    render(<EntityCard media={<img alt="Line 2" src="/line-2.jpg" />} mediaVariant="cover" title="Line 2" />);
    const img = screen.getByRole("img", { name: "Line 2" });
    expect(img.parentElement).toHaveClass("aspect-[4/3]", "overflow-hidden", "rounded-t-lg");
  });

  it("href makes the title a stretched link; onClick makes it a button", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<EntityCard title="Dana Whitfield" href="/people/dw" data-testid="card" />);
    const link = screen.getByRole("link", { name: "Dana Whitfield" });
    expect(link).toHaveAttribute("href", "/people/dw");
    expect(link).toHaveClass("after:absolute", "after:inset-0");
    expect(screen.getByTestId("card")).toHaveClass("hover:shadow-ls-2");
    rerender(<EntityCard title="Dana Whitfield" onClick={onClick} data-testid="card" />);
    await user.click(screen.getByRole("button", { name: "Dana Whitfield" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("selected swaps the border to accent; actions sit above the stretched link", () => {
    render(<EntityCard title="C-10422" href="/coils/1" selected actions={<button type="button">Actions</button>} data-testid="card" />);
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("border-accent");
    expect(card).not.toHaveClass("border-line");
    expect(card).toHaveAttribute("aria-current", "true");
    const actions = screen.getByRole("button", { name: "Actions" }).parentElement!;
    expect(actions).toHaveClass("z-[1]", "opacity-0", "group-hover/card:opacity-100", "group-focus-within/card:opacity-100");
  });

  it("EntityGrid lays cards out 1/2/3/4 across; className wins; refs forward", () => {
    const ref = React.createRef<HTMLDivElement>();
    const cardRef = React.createRef<HTMLElement>();
    render(
      <EntityGrid ref={ref} className="gap-6">
        <EntityCard ref={cardRef} title="A" className="p-0" />
      </EntityGrid>,
    );
    expect(ref.current).toHaveClass("grid", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3", "xl:grid-cols-4", "gap-6");
    expect(ref.current).not.toHaveClass("gap-4");
    expect(cardRef.current).toHaveClass("p-0");
  });
});
