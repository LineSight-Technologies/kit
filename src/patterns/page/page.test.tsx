import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Page, PageGrid, PageHeader, PageSection } from "./page";

describe("Page", () => {
  it("centres at the page max width by default and runs full width on request", () => {
    const { rerender } = render(<Page data-testid="p">x</Page>);
    expect(screen.getByTestId("p")).toHaveClass("max-w-page", "mx-auto", "px-6", "py-6");
    rerender(
      <Page data-testid="p" width="full">
        x
      </Page>,
    );
    expect(screen.getByTestId("p")).not.toHaveClass("max-w-page");
    expect(screen.getByTestId("p")).toHaveAttribute("data-width", "full");
  });

  it("forwards ref and lets className win", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Page ref={ref} className="px-0">
        x
      </Page>,
    );
    expect(ref.current).toHaveClass("px-0");
    expect(ref.current).not.toHaveClass("px-6");
  });
});

describe("PageHeader", () => {
  it("renders the title as the display h1 with status, badges and actions", () => {
    render(
      <PageHeader
        title="Work order WO-20418"
        status="In progress"
        badges={<span>Rush</span>}
        actions={
          <>
            <button type="button">Print traveler</button>
            <button type="button">Release</button>
          </>
        }
      />,
    );
    const h1 = screen.getByRole("heading", { level: 1, name: "Work order WO-20418" });
    expect(h1).toHaveClass("font-display", "text-2xl", "tracking-ls-display");
    const badge = screen.getByText("In Progress");
    expect(badge).toHaveAttribute("data-status", "in_progress");
    expect(screen.getByText("Rush")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Release" })).toBeInTheDocument();
  });

  it("renders a back control as a button or a link", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<PageHeader title="Coil" back={{ label: "Back to coils", onClick }} />);
    await user.click(screen.getByRole("button", { name: "Back to coils" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<PageHeader title="Coil" back={{ label: "Back to coils", href: "/coils" }} />);
    expect(screen.getByRole("link", { name: "Back to coils" })).toHaveAttribute("href", "/coils");
  });

  it("renders tabs under the title row and drops the bottom padding when it does", () => {
    const { rerender } = render(<PageHeader data-testid="h" title="Order" />);
    expect(screen.getByTestId("h")).toHaveClass("pb-4");
    rerender(<PageHeader data-testid="h" title="Order" tabs={<div role="tablist">tabs</div>} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByTestId("h")).toHaveClass("pb-0");
  });

  it("sticky positions the header at the top of the scroll area", () => {
    render(<PageHeader data-testid="h" title="Order" sticky />);
    expect(screen.getByTestId("h")).toHaveClass("sticky", "top-0", "z-sticky", "bg-surface");
    expect(screen.getByTestId("h")).not.toHaveAttribute("data-stuck");
  });

  it("forwards ref to the header element", () => {
    const ref = React.createRef<HTMLElement>();
    render(<PageHeader ref={ref} title="x" />);
    expect(ref.current?.tagName).toBe("HEADER");
  });
});

describe("PageSection", () => {
  it("is a labelled section with an h2 title and actions, plain by default", () => {
    render(
      <PageSection title="Pattern" actions={<button type="button">Edit pattern</button>}>
        <p>6 cuts</p>
      </PageSection>,
    );
    const section = screen.getByRole("region", { name: "Pattern" });
    expect(within(section).getByRole("heading", { level: 2 })).toHaveClass("text-base", "font-semibold");
    expect(section).toHaveClass("py-6", "gap-3");
    expect(section).not.toHaveClass("border", "bg-surface");
    expect(section).toHaveAttribute("data-section", "plain");
    expect(within(section).getByRole("button", { name: "Edit pattern" })).toBeInTheDocument();
  });

  it("card variant is the raised case", () => {
    render(
      <PageSection variant="card" data-testid="s">
        x
      </PageSection>,
    );
    expect(screen.getByTestId("s")).toHaveClass("rounded-lg", "border", "border-line", "bg-surface", "p-5");
    expect(screen.getByTestId("s")).not.toHaveClass("py-6");
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});

describe("PageGrid", () => {
  it("lays out two or three columns", () => {
    const { rerender } = render(<PageGrid data-testid="g">x</PageGrid>);
    expect(screen.getByTestId("g")).toHaveClass("grid", "md:grid-cols-2");
    expect(screen.getByTestId("g")).not.toHaveClass("xl:grid-cols-3");
    rerender(
      <PageGrid data-testid="g" columns={3}>
        x
      </PageGrid>,
    );
    expect(screen.getByTestId("g")).toHaveClass("xl:grid-cols-3");
  });
});
