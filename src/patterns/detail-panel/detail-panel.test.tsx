import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusBadge } from "../../primitives/badge/badge";
import { DetailPanel, Property, PropertyList, Timeline, TimelineItem } from "./detail-panel";

const NOW = new Date("2026-03-10T12:00:00");

describe("DetailPanel", () => {
  it("stacks children with gap-6, className wins, ref forwards", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <DetailPanel ref={ref} className="gap-8">
        <p>body</p>
      </DetailPanel>,
    );
    expect(ref.current).toHaveClass("flex", "flex-col", "gap-8");
    expect(ref.current).not.toHaveClass("gap-6");
  });
});

describe("PropertyList / Property", () => {
  it("renders label/value pairs in a definition list with responsive columns", () => {
    const { container } = render(
      <PropertyList
        columns={3}
        items={[
          { label: "Work order", value: "WO-20931" },
          { label: "Status", value: <StatusBadge status="in_progress" /> },
          { label: "Ship to", value: "Dock 3, 1180 Mill Rd", span: 2 },
        ]}
      />,
    );
    const dl = container.querySelector("dl")!;
    expect(dl).toHaveClass("grid", "sm:grid-cols-2", "lg:grid-cols-3");
    expect(screen.getByText("Work order").tagName).toBe("DT");
    expect(screen.getByText("WO-20931").closest("dd")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toHaveAttribute("data-status", "in_progress");
    expect(screen.getByText("Ship to").parentElement).toHaveClass("sm:col-span-2");
  });

  it("empty values render an en dash in the muted colour", () => {
    render(<PropertyList items={[{ label: "Heat number", value: null }, { label: "PO", value: "" }]} />);
    const dashes = screen.getAllByText("–");
    expect(dashes).toHaveLength(2);
    expect(dashes[0]).toHaveClass("text-fg-3");
  });

  it("copyable property copies the value and confirms", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(
      <PropertyList>
        <Property label="Coil" value="C-10422" copyable />
      </PropertyList>,
    );
    const button = screen.getByRole("button", { name: "Copy Coil" });
    expect(button).toHaveClass("opacity-0");
    await user.click(button);
    expect(writeText).toHaveBeenCalledWith("C-10422");
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
  });
});

describe("Timeline", () => {
  const items = [
    { id: "a", at: "2026-03-09T09:00:00", title: "Scheduled on Line 2", tone: "info" as const },
    { id: "b", at: "2026-03-10T11:30:00", title: "Slitting started", tone: "accent" as const, actor: { name: "Dana Whitfield" } },
    { id: "c", at: "2026-03-08T16:00:00", title: "Order received", body: "PO 44817 from the customer portal." },
  ];

  it("orders newest first by default and oldest first with order=asc", () => {
    const { unmount } = render(<Timeline items={items} now={NOW} />);
    let titles = screen.getAllByRole("listitem").map((li) => li.getAttribute("data-id"));
    expect(titles).toEqual(["b", "a", "c"]);
    unmount();
    render(<Timeline items={items} now={NOW} order="asc" />);
    titles = screen.getAllByRole("listitem").map((li) => li.getAttribute("data-id"));
    expect(titles).toEqual(["c", "a", "b"]);
  });

  it("shows relative times pinned to `now`, tone dots and actor avatars", () => {
    render(<Timeline items={items} now={NOW} />);
    expect(screen.getByText("30 minutes ago").closest("time")).toHaveAttribute("dateTime");
    expect(screen.getByText("yesterday")).toBeInTheDocument();
    expect(screen.getByText("2 days ago")).toBeInTheDocument();
    const info = screen.getAllByRole("listitem").find((li) => li.getAttribute("data-id") === "a")!;
    expect(info.querySelector(".bg-info")).toBeInTheDocument();
    expect(screen.getByText("DW")).toBeInTheDocument();
    expect(screen.getByText("PO 44817 from the customer portal.")).toHaveClass("text-fg-2");
  });

  it("loading sets aria-busy with placeholders; empty renders the fallback", () => {
    const { unmount } = render(<Timeline items={[]} loading data-testid="tl" />);
    expect(screen.getByTestId("tl")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByTestId("tl").querySelectorAll("li")).toHaveLength(3);
    unmount();
    render(<Timeline items={[]} empty={<p>No activity on this order</p>} />);
    expect(screen.getByText("No activity on this order")).toBeInTheDocument();
  });

  it("accepts TimelineItem children and forwards refs", () => {
    const ref = React.createRef<HTMLOListElement>();
    render(
      <Timeline ref={ref} now={NOW} className="gap-8">
        <TimelineItem id="x" at="2026-03-10T10:00:00" title="Knife change" tone="warn" />
      </Timeline>,
    );
    expect(ref.current).toHaveClass("gap-8");
    expect(ref.current).not.toHaveClass("gap-5");
    expect(screen.getByText("Knife change")).toBeInTheDocument();
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
  });
});
