import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
vi.mock("./entries", () => ({ ENTRIES: [] }));

import { Catalog, parseHash } from "./Catalog";
import { MANIFEST } from "./manifest";
import type { KitEntry } from "./types";

const GROUPS = Array.from(new Set(MANIFEST.map((m) => m.group)));

function setHash(hash: string) {
  act(() => {
    window.location.hash = hash;
  });
}

beforeEach(() => {
  window.history.replaceState(null, "", window.location.pathname);
});

describe("parseHash", () => {
  it("reads id and bare flag", () => {
    expect(parseHash("")).toEqual({ id: null, bare: false });
    expect(parseHash("#button")).toEqual({ id: "button", bare: false });
    expect(parseHash("#button?bare")).toEqual({ id: "button", bare: true });
    expect(parseHash("#data-table?bare=1&x=2")).toEqual({ id: "data-table", bare: true });
    expect(parseHash("#?bare")).toEqual({ id: null, bare: true });
  });
});

describe("Catalog", () => {
  it("renders a nav group for every manifest group with every entry", () => {
    render(<Catalog />);
    const nav = screen.getByRole("navigation", { name: "Catalog" });
    for (const g of GROUPS) expect(within(nav).getByText(g)).toBeInTheDocument();
    for (const m of MANIFEST) expect(within(nav).getByRole("link", { name: m.name })).toHaveAttribute("href", `#${m.id}`);
  });

  it("defaults to the first manifest entry", () => {
    render(<Catalog />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(MANIFEST[0]!.name);
  });

  it("filters the nav from the search box and hides empty groups", async () => {
    const user = userEvent.setup();
    render(<Catalog />);
    await user.type(screen.getByRole("searchbox", { name: "Search components" }), "butt");
    const nav = screen.getByRole("navigation", { name: "Catalog" });
    expect(within(nav).getByRole("link", { name: "Button" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "IconButton" })).toBeInTheDocument();
    expect(within(nav).queryByRole("link", { name: "Input" })).not.toBeInTheDocument();
    expect(within(nav).queryByText("Foundations")).not.toBeInTheDocument();
  });

  it("selects the entry named in the hash and follows hash changes", async () => {
    window.location.hash = "#input";
    render(<Catalog />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Input");
    expect(screen.getByRole("link", { name: "Input" })).toHaveAttribute("aria-current", "page");

    setHash("#switch");
    expect(await screen.findByRole("heading", { level: 1, name: "Switch" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Switch" })).toHaveAttribute("aria-current", "page");
  });

  it("falls back to the first entry for an unknown hash", () => {
    window.location.hash = "#not-a-real-id";
    render(<Catalog />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(MANIFEST[0]!.name);
  });

  it("shows the placeholder stage for an entry that is not built", () => {
    window.location.hash = "#pagination";
    render(<Catalog />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Pagination");
    expect(screen.getByText("Not built yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pagination" })).toHaveAttribute("data-built", "false");
  });

  it("renders a built entry's examples, code and props table", () => {
    const entry: KitEntry = {
      ...MANIFEST.find((m) => m.id === "button")!,
      examples: [
        { title: "Variants", render: () => <button type="button">Save coil</button>, code: "<Button>Save coil</Button>" },
        { title: "Sizes", render: () => <span>sizes</span> },
      ],
      props: [{ name: "variant", type: "'primary' | 'secondary'", default: "'primary'", description: "Visual weight." }],
    };
    window.location.hash = "#button";
    render(<Catalog entries={[entry]} />);
    expect(screen.getByRole("heading", { level: 2, name: "Variants" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save coil" })).toBeInTheDocument();
    expect(screen.getByText("<Button>Save coil</Button>")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
    const table = screen.getByRole("table");
    expect(within(table).getByText("variant")).toBeInTheDocument();
    expect(within(table).getByText("Visual weight.")).toBeInTheDocument();
    expect(screen.queryByText("Not built yet")).not.toBeInTheDocument();
  });

  it("copies the snippet to the clipboard", async () => {
    const user = userEvent.setup();
    const entry: KitEntry = {
      ...MANIFEST.find((m) => m.id === "kbd")!,
      examples: [{ title: "Default", render: () => <kbd>K</kbd>, code: "<Kbd>K</Kbd>" }],
    };
    window.location.hash = "#kbd";
    render(<Catalog entries={[entry]} />);
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(await navigator.clipboard.readText()).toBe("<Kbd>K</Kbd>");
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("keeps the catalog up when an example throws", () => {
    const Boom = () => {
      throw new Error("boom");
    };
    const entry: KitEntry = {
      ...MANIFEST.find((m) => m.id === "badge")!,
      examples: [
        { title: "Broken", render: () => <Boom /> },
        { title: "Fine", render: () => <span>fine</span> },
      ],
    };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    window.location.hash = "#badge";
    render(<Catalog entries={[entry]} />);
    spy.mockRestore();
    expect(screen.getByText("Failed to render")).toBeInTheDocument();
    expect(screen.getByText("fine")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Catalog" })).toBeInTheDocument();
  });

  it("bare mode renders only the example stages", () => {
    const entry: KitEntry = {
      ...MANIFEST.find((m) => m.id === "button")!,
      examples: [{ title: "Variants", render: () => <button type="button">Save coil</button>, code: "<Button/>" }],
    };
    window.location.hash = "#button?bare";
    const { container } = render(<Catalog entries={[entry]} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.queryByText("<Button/>")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save coil" })).toBeInTheDocument();
    expect(container.querySelector('[data-bare="button"] [data-stage="Variants"]')).not.toBeNull();
  });

  it("bare mode shows the placeholder for a missing entry", () => {
    window.location.hash = "#pagination?bare";
    const { container } = render(<Catalog />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(container.querySelector('[data-bare="pagination"] [data-stage="not-built"]')).toHaveTextContent("Not built yet");
  });

  it("bare prop works without a hash", () => {
    render(<Catalog bare entryId="select" />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(document.querySelector('[data-bare="select"]')).not.toBeNull();
  });

  it("controlled mode: entryId wins and onNavigate is called instead of changing the hash", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    window.location.hash = "#input";
    render(<Catalog entryId="switch" onNavigate={onNavigate} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Switch");
    await user.click(screen.getByRole("link", { name: "Dialog" }));
    expect(onNavigate).toHaveBeenCalledWith("dialog");
    expect(window.location.hash).toBe("#input");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Switch");
  });

  it("focuses the search box on /", async () => {
    const user = userEvent.setup();
    render(<Catalog />);
    const search = screen.getByRole("searchbox", { name: "Search components" });
    expect(search).not.toHaveFocus();
    await user.keyboard("/");
    expect(search).toHaveFocus();
    expect(search).toHaveValue("");
  });

  it("renders every foundations entry with at least one example", () => {
    for (const m of MANIFEST.filter((x) => x.group === "Foundations")) {
      window.location.hash = `#${m.id}`;
      const { unmount } = render(<Catalog />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(m.name);
      expect(screen.queryByText("Not built yet")).not.toBeInTheDocument();
      expect(screen.getAllByRole("heading", { level: 2 }).length).toBeGreaterThan(0);
      unmount();
    }
  });
});
