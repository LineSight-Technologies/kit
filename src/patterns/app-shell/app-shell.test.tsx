import * as React from "react";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Boxes, Factory, LayoutDashboard, ListOrdered, Scissors } from "lucide-react";
import {
  AppShell,
  SIDEBAR_STORAGE_KEY,
  Sidebar,
  SidebarGroup,
  SidebarItem,
  SidebarNav,
  SidebarSeparator,
  SidebarTrigger,
  useAppShell,
  type AppShellProps,
} from "./app-shell";

function Nav() {
  return (
    <>
      <SidebarNav>
        <SidebarItem icon={<LayoutDashboard />} label="Dashboard" href="/" active />
        <SidebarItem icon={<ListOrdered />} label="Orders" href="/orders" count={128} />
        <SidebarItem icon={<Boxes />} label="Inventory" onClick={() => {}} />
      </SidebarNav>
      <SidebarSeparator />
      <SidebarGroup label="Production" icon={<Factory />} storageKey="ls:test-group">
        <SidebarItem icon={<Scissors />} label="Slitters" href="/slitters" />
      </SidebarGroup>
    </>
  );
}

function App({ children, ...props }: Partial<AppShellProps>) {
  return (
    <AppShell toaster={false} storageKey={null} sidebar={<Sidebar brand={<span>LineSight</span>} footer={<span>M. Reyes</span>}><Nav /></Sidebar>} {...props}>
      {children ?? <h1>Orders</h1>}
    </AppShell>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("AppShell", () => {
  it("renders the sidebar landmark, the main region and nav items with active state and counts", () => {
    render(<App />);
    expect(screen.getByRole("main")).toContainElement(screen.getByRole("heading", { name: "Orders" }));
    const nav = screen.getByRole("navigation", { name: "Main" });
    const dashboard = within(nav).getByRole("link", { name: "Dashboard" });
    expect(dashboard).toHaveAttribute("aria-current", "page");
    expect(dashboard).toHaveClass("bg-surface", "shadow-ls-1", "h-9", "rounded-md");
    const orders = within(nav).getByRole("link", { name: /Orders/ });
    expect(orders).not.toHaveAttribute("aria-current");
    expect(orders).toHaveClass("text-fg-2");
    expect(orders.querySelector("[data-count]")).toHaveTextContent("128");
    expect(within(nav).getByRole("button", { name: "Inventory" })).toBeInTheDocument();
    expect(screen.getByRole("separator")).toBeInTheDocument();
    expect(screen.getByText("M. Reyes")).toBeInTheDocument();
  });

  it("collapses to the rail: icon-only items, counts hidden, group becomes a flyout menu", async () => {
    const user = userEvent.setup();
    render(<App />);
    const aside = screen.getByRole("complementary");
    expect(aside).toHaveClass("w-sidebar");
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(aside).toHaveClass("w-rail");
    expect(aside).toHaveAttribute("data-collapsed");
    const orders = within(aside).getByRole("link", { name: "Orders" });
    expect(orders.querySelector("[data-count]")).toBeNull();
    expect(orders).toHaveClass("justify-center");
    // The group is now one icon that opens a menu holding its items.
    const groupTrigger = within(aside).getByRole("button", { name: "Production" });
    await user.click(groupTrigger);
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByText("Production")).toBeInTheDocument();
    const item = within(menu).getByRole("menuitem", { name: "Slitters" });
    expect(item.tagName).toBe("A");
    expect(item).toHaveAttribute("href", "/slitters");
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Expand sidebar" }));
    expect(aside).toHaveClass("w-sidebar");
  });

  it("persists the collapsed state under ls:sidebar-collapsed and reads it back on mount", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App storageKey={SIDEBAR_STORAGE_KEY} />);
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(window.localStorage.getItem("ls:sidebar-collapsed")).toBe("1");
    unmount();
    render(<App storageKey={SIDEBAR_STORAGE_KEY} />);
    await waitFor(() => expect(screen.getByRole("complementary")).toHaveClass("w-rail"));
  });

  it("does not touch storage when storageKey is null, and honours defaultCollapsed", async () => {
    const user = userEvent.setup();
    render(<App defaultCollapsed />);
    expect(screen.getByRole("complementary")).toHaveClass("w-rail");
    await user.click(screen.getByRole("button", { name: "Expand sidebar" }));
    expect(window.localStorage.getItem("ls:sidebar-collapsed")).toBeNull();
  });

  it("opens the mobile drawer from the trigger and closes it when an item is chosen", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    const drawer = await screen.findByRole("dialog", { name: "Navigation" });
    expect(drawer).toHaveAttribute("data-side", "left");
    await user.click(within(drawer).getByRole("button", { name: "Inventory" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("layout='mobile' hides the desktop sidebar and routes the trigger to the drawer", async () => {
    const user = userEvent.setup();
    render(<App layout="mobile" />);
    expect(screen.getByRole("complementary", { hidden: true })).toHaveClass("hidden");
    expect(screen.getByRole("complementary", { hidden: true })).not.toHaveClass("md:flex");
    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(await screen.findByRole("dialog", { name: "Navigation" })).toBeInTheDocument();
  });

  it("exposes state through useAppShell and throws outside a shell", () => {
    function Probe() {
      const { collapsed, setCollapsed } = useAppShell();
      return (
        <button type="button" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "collapsed" : "expanded"}
        </button>
      );
    }
    render(
      <App>
        <Probe />
      </App>,
    );
    const btn = screen.getByRole("button", { name: "expanded" });
    act(() => btn.click());
    expect(screen.getByRole("button", { name: "collapsed" })).toBeInTheDocument();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/inside <AppShell>/);
    spy.mockRestore();
  });
});

describe("SidebarGroup", () => {
  it("toggles its items with aria-expanded, rotates the chevron and remembers the state", async () => {
    const user = userEvent.setup();
    render(<App />);
    const header = screen.getByRole("button", { name: "Production" });
    expect(header).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Slitters" })).toBeInTheDocument();
    await user.click(header);
    expect(header).toHaveAttribute("aria-expanded", "false");
    expect(header.querySelector("svg")).toHaveClass("-rotate-90");
    expect(screen.queryByRole("link", { name: "Slitters" })).not.toBeInTheDocument();
    expect(window.localStorage.getItem("ls:test-group")).toBe("0");
  });
});

describe("SidebarItem", () => {
  it("renders the child element with asChild and forwards refs and className", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <App>
        <SidebarNav label="Secondary">
          <SidebarItem ref={ref} asChild icon={<Boxes />} label="Coils" count={12} className="px-9">
            <a href="/coils" data-router-link="" />
          </SidebarItem>
        </SidebarNav>
      </App>,
    );
    const link = screen.getByRole("link", { name: /Coils/ });
    expect(link).toHaveAttribute("data-router-link");
    expect(link).toHaveClass("px-9");
    expect(link).not.toHaveClass("px-2.5");
    expect(link).toHaveTextContent("12");
    expect(ref.current).toBe(link);
  });

  it("disabled items are inert", () => {
    render(
      <App>
        <SidebarNav label="Secondary">
          <SidebarItem icon={<Boxes />} label="Archive" onClick={() => {}} disabled />
        </SidebarNav>
      </App>,
    );
    expect(screen.getByRole("button", { name: "Archive" })).toBeDisabled();
  });
});

describe("SidebarTrigger", () => {
  it("uses the viewport to pick collapse vs drawer in auto mode", async () => {
    const user = userEvent.setup();
    const original = window.matchMedia;
    window.matchMedia = ((q: string) => ({ ...original(q), matches: true })) as typeof window.matchMedia;
    render(
      <App>
        <SidebarTrigger />
      </App>,
    );
    const triggers = screen.getAllByRole("button", { name: "Collapse sidebar" });
    await user.click(triggers[triggers.length - 1]!);
    expect(screen.getByRole("complementary")).toHaveClass("w-rail");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    window.matchMedia = original;
  });
});
