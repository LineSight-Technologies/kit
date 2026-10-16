import * as React from "react";
import { Boxes, CalendarDays, Factory, LayoutDashboard, ListOrdered, Plus, Scissors, Users, Wrench } from "lucide-react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { cn } from "../../lib/cn";
import { Button } from "../../primitives/button/button";
import { EmptyState } from "../empty-state/empty-state";
import { Page, PageHeader } from "../page/page";
import { FilterMenu, SearchInput, Toolbar } from "../toolbar/toolbar";
import { AppShell, Sidebar, SidebarGroup, SidebarItem, SidebarNav, SidebarSeparator, useSidebar, type AppShellProps } from "./app-shell";

const meta = MANIFEST.find((m) => m.id === "app-shell")!;

function Brand() {
  return <span className="truncate px-1 font-display text-base font-semibold tracking-ls-display text-fg">LineSight</span>;
}

function Mark() {
  return <span className="flex size-7 items-center justify-center rounded-md bg-accent text-sm font-semibold text-accent-fg">L</span>;
}

function UserFooter() {
  const { collapsed } = useSidebar();
  return (
    <button
      type="button"
      className={cn(
        "flex h-9 items-center gap-2.5 rounded-md text-sm text-fg-2 outline-none transition-colors duration-150 hover:bg-surface-3 hover:text-fg focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2",
        collapsed ? "w-10 justify-center" : "w-full px-2",
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-3 text-xs font-medium text-fg">MR</span>
      {collapsed ? null : <span className="truncate">M. Reyes</span>}
    </button>
  );
}

const STATUSES = ["Open", "Scheduled", "In progress", "Complete"];

function DemoNav({ active }: { active: string }) {
  return (
    <>
      <SidebarNav>
        <SidebarItem icon={<LayoutDashboard />} label="Dashboard" href="#app-shell" active={active === "Dashboard"} />
        <SidebarItem icon={<ListOrdered />} label="Orders" href="#app-shell" count={128} active={active === "Orders"} />
        <SidebarItem icon={<Boxes />} label="Inventory" href="#app-shell" count={2431} active={active === "Inventory"} />
        <SidebarItem icon={<CalendarDays />} label="Schedule" href="#app-shell" active={active === "Schedule"} />
      </SidebarNav>
      <SidebarSeparator />
      <SidebarGroup label="Production" icon={<Factory />}>
        <SidebarItem icon={<Scissors />} label="Slitters" href="#app-shell" />
        <SidebarItem icon={<Wrench />} label="Work orders" href="#app-shell" count={17} />
      </SidebarGroup>
      <SidebarSeparator />
      <SidebarNav label="Directory">
        <SidebarItem icon={<Users />} label="Customers" href="#app-shell" />
      </SidebarNav>
    </>
  );
}

function MiniApp({ className, shortcut = false, ...props }: Partial<AppShellProps> & { shortcut?: boolean }) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<string | undefined>("Open");
  return (
    <div className={cn("h-[560px] w-full overflow-hidden rounded-lg border border-line", className)}>
      <AppShell
        toaster={false}
        storageKey={null}
        className="h-full"
        sidebar={
          <Sidebar brand={<Brand />} mark={<Mark />} footer={<UserFooter />}>
            <DemoNav active="Orders" />
          </Sidebar>
        }
        {...props}
      >
        <Page>
          <PageHeader title="Orders" actions={<Button leadingIcon={<Plus />}>New order</Button>} />
          <Toolbar
            search={<SearchInput value={query} onChange={setQuery} shortcut={shortcut} placeholder="Search orders" />}
            filters={
              <FilterMenu label="Status" value={status} onClear={() => setStatus(undefined)}>
                <div className="flex flex-col gap-0.5">
                  {STATUSES.map((s) => (
                    <Button key={s} variant="ghost" size="sm" className="justify-start" onClick={() => setStatus(s)}>
                      {s}
                    </Button>
                  ))}
                </div>
              </FilterMenu>
            }
          />
          <EmptyState
            icon={<ListOrdered />}
            title={status || query ? "No orders match these filters" : "No open orders"}
            action={
              status || query ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStatus(undefined);
                    setQuery("");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button leadingIcon={<Plus />}>New order</Button>
              )
            }
          />
        </Page>
      </AppShell>
    </div>
  );
}

export const appShellEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Expanded",
      wide: true,
      render: () => <MiniApp shortcut />,
      code: `<AppShell
  sidebar={
    <Sidebar brand={<Logo />} mark={<LogoMark />} footer={<UserMenu />}>
      <SidebarNav>
        <SidebarItem icon={<LayoutDashboard />} label="Dashboard" asChild active>
          <Link to="/" />
        </SidebarItem>
        <SidebarItem icon={<ListOrdered />} label="Orders" count={128} asChild>
          <Link to="/orders" />
        </SidebarItem>
      </SidebarNav>
      <SidebarSeparator />
      <SidebarGroup label="Production" icon={<Factory />} storageKey="ls:nav-production">
        <SidebarItem icon={<Scissors />} label="Slitters" asChild><Link to="/slitters" /></SidebarItem>
      </SidebarGroup>
    </Sidebar>
  }
  commandMenu={<CommandMenu open={open} onOpenChange={setOpen} groups={groups} />}
>
  <Outlet />
</AppShell>`,
    },
    {
      title: "Collapsed rail",
      wide: true,
      render: () => <MiniApp defaultCollapsed />,
      code: `// Persisted under localStorage "ls:sidebar-collapsed"; read it with useAppShell().
const { collapsed, setCollapsed } = useAppShell();`,
    },
    {
      title: "Mobile drawer",
      render: () => <MiniApp layout="mobile" className="w-[390px]" />,
      code: `// Below md the sidebar becomes a left Sheet opened by the SidebarTrigger in the top bar.
// layout="mobile" forces that presentation (this example); apps leave it on "auto".`,
    },
  ],
  props: [
    { name: "sidebar", type: "ReactNode", description: "A Sidebar." },
    { name: "commandMenu", type: "ReactNode", description: "A CommandMenu, mounted once here." },
    { name: "defaultCollapsed", type: "boolean", default: "false", description: "Initial rail state before a stored value is read." },
    { name: "storageKey", type: "string | null", default: "'ls:sidebar-collapsed'", description: "localStorage key for the collapsed state; null disables persistence." },
    { name: "layout", type: "'auto' | 'mobile'", default: "'auto'", description: "auto follows the md breakpoint; mobile always uses the drawer." },
    { name: "toaster", type: "boolean", default: "true", description: "Mount the kit Toaster." },
    { name: "Sidebar.brand / mark / footer", type: "ReactNode", description: "Logo slot, its collapsed stand-in, and the user-menu slot. useSidebar() tells slot content whether the rail is collapsed." },
    { name: "SidebarItem.icon / label / href / asChild", type: "ReactNode / string / string / boolean", description: "Renders an <a> with href, a button with onClick, or the single child (router Link) with asChild." },
    { name: "SidebarItem.active / count", type: "boolean / number", description: "Raised pill + aria-current='page'; tabular count hidden on the rail." },
    { name: "SidebarGroup.label / icon / defaultOpen / storageKey", type: "string / ReactNode / boolean / string", description: "Collapsible group; on the rail it becomes one icon with a flyout menu of its items." },
    { name: "SidebarTrigger.mode", type: "'auto' | 'collapse' | 'drawer'", default: "'auto'", description: "PanelLeft control. auto collapses on md and up, opens the drawer below it." },
    { name: "useAppShell()", type: "{ collapsed, setCollapsed, mobileOpen, setMobileOpen, layout }", description: "Shell state for anything outside the Sidebar." },
  ],
};
