import * as React from "react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table/table";
import { Pagination } from "./pagination";

const meta = MANIFEST.find((m) => m.id === "pagination")!;

function Live({ total, withSize = true }: { total: number; withSize?: boolean }) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  return (
    <Pagination
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={setPage}
      onPageSizeChange={
        withSize
          ? (n) => {
              setPageSize(n);
              setPage(1);
            }
          : undefined
      }
      className="w-full max-w-xl"
    />
  );
}

function UnderTable() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const total = 1204;
  const start = (page - 1) * pageSize;
  const rows = Array.from({ length: Math.min(5, total - start) }, (_, i) => ({
    id: `SO-${8810 + start + i}`,
    customer: ["Northgate Fabrication", "Harbor Metals", "Ridgeline Steel", "Pioneer Tube"][(start + i) % 4],
    width: ((start + i) % 3 === 0 ? 12 : (start + i) % 3 === 1 ? 9.5 : 24).toFixed(3),
  }));
  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <Table density="compact">
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead numeric>Width (in)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.id}</TableCell>
              <TableCell>{r.customer}</TableCell>
              <TableCell numeric>{r.width}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(n) => {
          setPageSize(n);
          setPage(1);
        }}
      />
    </div>
  );
}

export const paginationEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Default with page-size select",
      wide: true,
      render: () => <Live total={1204} />,
      code: `<Pagination\n  page={page}\n  pageSize={pageSize}\n  total={1204}\n  onPageChange={setPage}\n  onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}\n/>`,
    },
    {
      title: "Without page-size, single page, empty",
      wide: true,
      render: () => (
        <div className="flex w-full flex-col gap-3">
          <Live total={1204} withSize={false} />
          <Live total={10} withSize={false} />
          <Live total={0} withSize={false} />
        </div>
      ),
      code: `<Pagination page={1} pageSize={25} total={10} onPageChange={setPage} />`,
    },
    { title: "Under a table (first five rows shown)", wide: true, render: () => <UnderTable /> },
  ],
  props: [
    { name: "page", type: "number", description: "1-based current page." },
    { name: "pageSize", type: "number", description: "Rows per page." },
    { name: "total", type: "number", description: "Total rows; drives the range text and bounds." },
    { name: "onPageChange", type: "(page) => void", description: "" },
    { name: "onPageSizeChange", type: "(pageSize) => void", description: "Renders the page-size select when provided." },
    { name: "pageSizeOptions", type: "number[]", default: "[25, 50, 100]", description: "" },
  ],
};
