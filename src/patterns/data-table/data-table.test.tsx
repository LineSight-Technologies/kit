import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColumnVisibilityMenu, DataTable, col, type DataTableColumn } from "./data-table";

interface Coil {
  id: string;
  grade: string;
  widthIn: number;
  weightLbs: number;
  status: string;
  receivedAt: string;
}

const coils: Coil[] = [
  { id: "C-10422", grade: "HDG G90", widthIn: 48, weightLbs: 42180, status: "available", receivedAt: "2026-03-04T10:00:00" },
  { id: "C-10423", grade: "HDG G90", widthIn: 60, weightLbs: 38900, status: "scheduled", receivedAt: "2026-03-05T10:00:00" },
  { id: "C-10431", grade: "CR", widthIn: 36, weightLbs: 21450, status: "available", receivedAt: "2026-03-06T10:00:00" },
  { id: "C-10440", grade: "HRPO", widthIn: 72, weightLbs: 51020, status: "on_hold", receivedAt: "2026-03-07T10:00:00" },
  { id: "C-10441", grade: "CR", widthIn: 24, weightLbs: 12300, status: "available", receivedAt: "2026-03-08T10:00:00" },
  { id: "C-10450", grade: "HRPO", widthIn: 54, weightLbs: 44010, status: "scheduled", receivedAt: "2026-03-09T10:00:00" },
];

const columns: DataTableColumn<Coil>[] = [
  col.text<Coil>("id", "Coil"),
  col.text<Coil>("grade", "Grade"),
  col.number<Coil>("widthIn", "Width (in)", { digits: 3 }),
  col.number<Coil>("weightLbs", "Weight (lb)", { digits: 0 }),
  col.status<Coil>("status", "Status"),
  col.date<Coil>("receivedAt", "Received"),
];

const bodyRows = (container: HTMLElement) => Array.from(container.querySelectorAll("tbody tr"));
const firstCellText = (container: HTMLElement) => bodyRows(container).map((r) => r.querySelector("td")?.textContent);

describe("DataTable", () => {
  it("renders declared columns, formats numbers and dates, aligns numeric cells", () => {
    const { container } = render(<DataTable columns={columns} data={coils} caption="Coil inventory" getRowId={(c) => c.id} />);
    expect(screen.getByRole("table", { name: "Coil inventory" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Width \(in\)/ })).toHaveClass("text-right", "tabular-nums");
    expect(bodyRows(container)).toHaveLength(6);
    expect(screen.getByRole("cell", { name: "48.000" })).toHaveClass("text-right", "tabular-nums");
    expect(screen.getByRole("cell", { name: "42,180" })).toBeInTheDocument();
    expect(screen.getByText("Mar 4, 2026").closest("time")).toHaveAttribute("dateTime");
    expect(screen.getAllByText("Available")[0]).toHaveAttribute("data-status", "available");
  });

  it("sorts on header click: ascending, descending, cleared", async () => {
    const user = userEvent.setup();
    const { container } = render(<DataTable columns={columns} data={coils} getRowId={(c) => c.id} />);
    const header = screen.getByRole("columnheader", { name: /Width \(in\)/ });
    const button = within(header).getByRole("button");
    await user.click(button);
    expect(header).toHaveAttribute("aria-sort", "ascending");
    expect(firstCellText(container)[0]).toBe("C-10441");
    await user.click(button);
    expect(header).toHaveAttribute("aria-sort", "descending");
    expect(firstCellText(container)[0]).toBe("C-10440");
    await user.click(button);
    expect(header).not.toHaveAttribute("aria-sort");
    expect(firstCellText(container)[0]).toBe("C-10422");
  });

  it("manualSorting only reports the change and leaves the order to the server", async () => {
    const user = userEvent.setup();
    const onSortingChange = vi.fn();
    const { container } = render(
      <DataTable columns={columns} data={coils} getRowId={(c) => c.id} manualSorting sorting={[]} onSortingChange={onSortingChange} />,
    );
    await user.click(within(screen.getByRole("columnheader", { name: /Grade/ })).getByRole("button"));
    expect(onSortingChange).toHaveBeenCalledWith([{ id: "grade", desc: false }]);
    expect(firstCellText(container)[0]).toBe("C-10422");
  });

  it("selection: row checkboxes, indeterminate header, onSelectionChange with records", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const { container } = render(
      <DataTable columns={columns} data={coils} getRowId={(c) => c.id} enableRowSelection onSelectionChange={onSelectionChange} />,
    );
    const header = screen.getByRole("checkbox", { name: "Select all rows" });
    const rowBoxes = screen.getAllByRole("checkbox", { name: "Select row" });
    expect(rowBoxes).toHaveLength(6);
    await user.click(rowBoxes[2]!);
    expect(onSelectionChange).toHaveBeenLastCalledWith([coils[2]]);
    expect(header).toHaveAttribute("data-state", "indeterminate");
    expect(bodyRows(container)[2]).toHaveAttribute("data-state", "selected");
    await user.click(header);
    expect(header).toHaveAttribute("data-state", "checked");
    expect(onSelectionChange).toHaveBeenLastCalledWith(coils);
  });

  it("renderBulkBar shows while rows are selected and clear() resets", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={coils}
        getRowId={(c) => c.id}
        enableRowSelection
        renderBulkBar={(count, clear) => (
          <div data-testid="bulk">
            {count} selected <button onClick={clear}>Clear</button>
          </div>
        )}
      />,
    );
    expect(screen.queryByTestId("bulk")).not.toBeInTheDocument();
    await user.click(screen.getAllByRole("checkbox", { name: "Select row" })[0]!);
    expect(screen.getByTestId("bulk")).toHaveTextContent("1 selected");
    await user.click(screen.getByText("Clear"));
    expect(screen.queryByTestId("bulk")).not.toBeInTheDocument();
  });

  it("onRowClick: click and Enter activate, controls inside the row do not", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    const { container } = render(<DataTable columns={columns} data={coils} getRowId={(c) => c.id} enableRowSelection onRowClick={onRowClick} />);
    const [first, second] = bodyRows(container) as HTMLElement[];
    expect(first).toHaveAttribute("tabindex", "0");
    expect(first).toHaveClass("cursor-pointer");
    await user.click(within(first!).getByText("C-10422"));
    expect(onRowClick).toHaveBeenLastCalledWith(coils[0]);
    second!.focus();
    await user.keyboard("{Enter}");
    expect(onRowClick).toHaveBeenLastCalledWith(coils[1]);
    await user.click(within(first!).getByRole("checkbox"));
    expect(onRowClick).toHaveBeenCalledTimes(2);
  });

  it("rowHref wraps the first data cell in a link", () => {
    const { container } = render(<DataTable columns={columns} data={coils} getRowId={(c) => c.id} enableRowSelection rowHref={(c) => `/coils/${c.id}`} />);
    const link = within(bodyRows(container)[0] as HTMLElement).getByRole("link", { name: "C-10422" });
    expect(link).toHaveAttribute("href", "/coils/C-10422");
  });

  it("loading renders skeleton rows and sets aria-busy", () => {
    const { container } = render(<DataTable columns={columns} data={[]} loading data-testid="dt" />);
    expect(screen.getByTestId("dt")).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector("[data-loading]")!.children).toHaveLength(8);
    expect(screen.getAllByRole("columnheader")).toHaveLength(6);
  });

  it("empty body defaults to an EmptyState and accepts a custom node", () => {
    const { unmount } = render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText("No results")).toBeInTheDocument();
    unmount();
    render(<DataTable columns={columns} data={[]} empty={<p>No coils in Bay 4</p>} />);
    expect(screen.getByText("No coils in Bay 4")).toBeInTheDocument();
  });

  it("error renders an ErrorState in the body", () => {
    const { container } = render(<DataTable columns={columns} data={coils} error={new Error("boom")} onRetry={() => {}} />);
    expect(container.querySelector("[data-error]")).toBeInTheDocument();
    expect(bodyRows(container)).toHaveLength(1);
  });

  it("pages on the client when total is omitted", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const { container } = render(
      <DataTable columns={columns} data={coils} getRowId={(c) => c.id} pagination={{ page: 1, pageSize: 2, onPageChange }} />,
    );
    expect(bodyRows(container)).toHaveLength(2);
    expect(screen.getByText("1–2 of 6")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("renders every given row when total is server-side", () => {
    const { container } = render(
      <DataTable columns={columns} data={coils} getRowId={(c) => c.id} pagination={{ page: 2, pageSize: 6, total: 1204, onPageChange: () => {} }} />,
    );
    expect(bodyRows(container)).toHaveLength(6);
    expect(screen.getByText("7–12 of 1,204")).toBeInTheDocument();
  });

  it("rowActions appends an ActionMenu column", () => {
    render(<DataTable columns={columns} data={coils} getRowId={(c) => c.id} rowActions={() => [{ label: "Edit", onSelect: () => {} }]} />);
    expect(screen.getAllByRole("button", { name: "Row actions" })).toHaveLength(6);
  });

  it("columnVisibility hides columns; ColumnVisibilityMenu toggles them", async () => {
    const user = userEvent.setup();
    const onColumnVisibilityChange = vi.fn();
    render(
      <>
        <ColumnVisibilityMenu columns={columns} columnVisibility={{ grade: false }} onColumnVisibilityChange={onColumnVisibilityChange} />
        <DataTable columns={columns} data={coils} getRowId={(c) => c.id} columnVisibility={{ grade: false }} />
      </>,
    );
    expect(screen.queryByRole("columnheader", { name: /Grade/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(5);
    await user.click(screen.getByRole("button", { name: "Columns" }));
    const items = await screen.findAllByRole("menuitemcheckbox");
    expect(items.map((i) => i.textContent)).toEqual(["Coil", "Grade", "Width (in)", "Weight (lb)", "Status", "Received"]);
    expect(items[1]).toHaveAttribute("aria-checked", "false");
    await user.click(items[1]!);
    expect(onColumnVisibilityChange).toHaveBeenCalledWith({ grade: true });
  });

  it("compact density, pinned first column, className and ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(
      <DataTable ref={ref} className="gap-0" columns={columns} data={coils} getRowId={(c) => c.id} density="compact" pinFirstColumn stickyHeader />,
    );
    expect(ref.current).toHaveClass("gap-0");
    expect(ref.current).not.toHaveClass("gap-3");
    expect(ref.current).toHaveAttribute("data-density", "compact");
    expect(screen.getByRole("cell", { name: "C-10422" })).toHaveClass("py-1.5", "sticky", "left-0");
    const head = screen.getByRole("columnheader", { name: /Coil/ });
    expect(head).toHaveClass("sticky", "top-0", "z-sticky");
    expect(container.querySelector("table")).toHaveClass("border-separate");
  });
});
