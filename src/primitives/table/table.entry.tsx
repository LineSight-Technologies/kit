import { Pencil, Trash2 } from "lucide-react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { ActionMenu } from "../dropdown-menu/dropdown-menu";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./table";

const meta = MANIFEST.find((m) => m.id === "table")!;

const coils = [
  { id: "C-10422", product: "HDG G90", width: "48.000", gauge: "0.0598", weight: "42,180", status: "Available" },
  { id: "C-10423", product: "HDG G90", width: "60.000", gauge: "0.0478", weight: "38,900", status: "Scheduled" },
  { id: "C-10431", product: "CR", width: "36.000", gauge: "0.0299", weight: "21,450", status: "Available" },
  { id: "C-10440", product: "HRPO", width: "72.000", gauge: "0.1196", weight: "51,020", status: "On hold" },
];

function CoilTable({ density, selected }: { density?: "compact" | "default"; selected?: string }) {
  return (
    <Table density={density}>
      <TableCaption>Coils in Bay 4</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Coil</TableHead>
          <TableHead>Product</TableHead>
          <TableHead numeric>Width (in)</TableHead>
          <TableHead numeric>Gauge (in)</TableHead>
          <TableHead numeric>Weight (lb)</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {coils.map((c) => (
          <TableRow key={c.id} data-state={c.id === selected ? "selected" : undefined}>
            <TableCell className="font-medium">{c.id}</TableCell>
            <TableCell>{c.product}</TableCell>
            <TableCell numeric>{c.width}</TableCell>
            <TableCell numeric>{c.gauge}</TableCell>
            <TableCell numeric>{c.weight}</TableCell>
            <TableCell>{c.status}</TableCell>
            <TableCell className="py-0">
              <ActionMenu
                items={[
                  { label: "Edit", icon: <Pencil />, onSelect: () => {} },
                  { separator: true },
                  { label: "Delete", icon: <Trash2 />, destructive: true, onSelect: () => {} },
                ]}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export const tableEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Default density with numeric columns and a selected row",
      wide: true,
      render: () => <CoilTable selected="C-10423" />,
      code: `<Table>\n  <TableCaption>Coils in Bay 4</TableCaption>\n  <TableHeader>\n    <TableRow>\n      <TableHead>Coil</TableHead>\n      <TableHead numeric>Width (in)</TableHead>\n    </TableRow>\n  </TableHeader>\n  <TableBody>\n    <TableRow data-state="selected">\n      <TableCell>C-10422</TableCell>\n      <TableCell numeric>48.000</TableCell>\n    </TableRow>\n  </TableBody>\n</Table>`,
    },
    {
      title: "Compact density",
      wide: true,
      render: () => <CoilTable density="compact" />,
      code: `<Table density="compact">…</Table>`,
    },
    {
      title: "Small static table: pattern summary",
      render: () => (
        <Table wrapperClassName="w-80">
          <TableCaption>Pattern 3 cuts</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Cut</TableHead>
              <TableHead numeric>Width (in)</TableHead>
              <TableHead numeric>Qty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ["SO-8810", "12.000", "2"],
              ["SO-8812", "9.500", "2"],
              ["Scrap", "0.625", "1"],
            ].map(([cut, w, q]) => (
              <TableRow key={cut}>
                <TableCell>{cut}</TableCell>
                <TableCell numeric>{w}</TableCell>
                <TableCell numeric>{q}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ),
    },
  ],
  props: [
    { name: "density", type: "'compact' | 'default'", default: "'default'", description: "Row height h-10/py-2.5 or h-8/py-1.5, through context." },
    { name: "wrapperClassName", type: "string", description: "Classes for the scrolling, bordered wrapper rather than the table element." },
    { name: "TableHead.numeric / TableCell.numeric", type: "boolean", default: "false", description: "Right-aligned, tabular figures." },
    { name: "TableRow[data-state=selected]", type: "attribute", description: "Selected row tint (accent-soft)." },
  ],
};
