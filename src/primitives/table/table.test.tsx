import * as React from "react";
import { render, screen } from "@testing-library/react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./table";

function Demo(props: { density?: "compact" | "default" }) {
  return (
    <Table density={props.density} data-testid="table">
      <TableCaption>Coils on line 2</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Coil</TableHead>
          <TableHead numeric>Width (in)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow data-state="selected">
          <TableCell>C-10422</TableCell>
          <TableCell numeric>48.000</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>C-10423</TableCell>
          <TableCell numeric>60.000</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

describe("Table", () => {
  it("renders a table with header, rows and an sr-only caption", () => {
    render(<Demo />);
    const table = screen.getByRole("table", { name: "Coils on line 2" });
    expect(table).toHaveClass("w-full", "text-sm");
    expect(table.parentElement).toHaveClass("overflow-auto", "rounded-lg", "border-line");
    expect(screen.getByText("Coils on line 2")).toHaveClass("sr-only");
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
  });

  it("numeric cells and heads are right-aligned and tabular", () => {
    render(<Demo />);
    expect(screen.getByRole("columnheader", { name: "Width (in)" })).toHaveClass("text-right", "tabular-nums");
    expect(screen.getByRole("cell", { name: "48.000" })).toHaveClass("text-right", "tabular-nums");
    expect(screen.getByRole("columnheader", { name: "Coil" })).toHaveClass("text-left");
  });

  it("default density is h-10 / py-2.5; compact is h-8 / py-1.5", () => {
    const { unmount } = render(<Demo />);
    expect(screen.getByRole("columnheader", { name: "Coil" })).toHaveClass("h-10");
    expect(screen.getByRole("cell", { name: "C-10422" })).toHaveClass("py-2.5");
    unmount();
    render(<Demo density="compact" />);
    expect(screen.getByTestId("table")).toHaveAttribute("data-density", "compact");
    expect(screen.getByRole("columnheader", { name: "Coil" })).toHaveClass("h-8");
    expect(screen.getByRole("cell", { name: "C-10422" })).toHaveClass("py-1.5");
  });

  it("rows carry hover, border and selected classes", () => {
    render(<Demo />);
    const [, selected, plain] = screen.getAllByRole("row");
    expect(selected).toHaveClass("data-[state=selected]:bg-accent-soft", "hover:bg-surface-2", "last:border-0");
    expect(selected).toHaveAttribute("data-state", "selected");
    expect(plain).not.toHaveAttribute("data-state");
  });

  it("className wins and refs forward", () => {
    const ref = React.createRef<HTMLTableElement>();
    const cellRef = React.createRef<HTMLTableCellElement>();
    render(
      <Table ref={ref} className="text-xs">
        <TableBody>
          <TableRow>
            <TableCell ref={cellRef} className="px-6">
              x
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(ref.current).toHaveClass("text-xs");
    expect(ref.current).not.toHaveClass("text-sm");
    expect(cellRef.current).toHaveClass("px-6");
    expect(cellRef.current).not.toHaveClass("px-3");
  });
});
