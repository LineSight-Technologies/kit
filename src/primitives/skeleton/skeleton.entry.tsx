import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Skeleton, SkeletonRow, SkeletonText, SkeletonTile } from "./skeleton";

const meta = MANIFEST.find((m) => m.id === "skeleton")!;

export const skeletonEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Blocks",
      render: () => (
        <div className="flex flex-wrap items-end gap-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-24 w-40 rounded-lg" />
        </div>
      ),
      code: `<Skeleton className="h-4 w-40" />
<Skeleton className="h-9 w-28" />
<Skeleton className="size-8 rounded-full" />`,
    },
    {
      title: "SkeletonText",
      render: () => (
        <div className="flex w-80 flex-col gap-6">
          <SkeletonText />
          <SkeletonText lines={2} />
          <SkeletonText lines={1} />
        </div>
      ),
      code: `<SkeletonText />          // 3 lines
<SkeletonText lines={2} />`,
    },
    {
      title: "SkeletonRow (table loading)",
      render: () => (
        <div className="w-full max-w-xl overflow-hidden rounded-lg border border-line bg-surface">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow cells={6} className="border-b-0" />
        </div>
      ),
      code: `{Array.from({ length: pageSize }, (_, i) => <SkeletonRow key={i} cells={columns.length} />)}`,
      wide: true,
    },
    {
      title: "SkeletonTile (stat loading)",
      render: () => (
        <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
          <SkeletonTile />
          <SkeletonTile />
          <SkeletonTile />
          <SkeletonTile />
        </div>
      ),
      code: `<StatRow>{loading ? <SkeletonTile /> : <StatTile … />}</StatRow>`,
      wide: true,
    },
    {
      title: "In context: order detail loading",
      render: () => (
        <div className="flex w-full max-w-xl flex-col gap-4 rounded-lg border border-line bg-surface p-4 shadow-ls-1">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-md" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <SkeletonText lines={2} />
            <SkeletonText lines={2} />
            <SkeletonText lines={2} />
          </div>
        </div>
      ),
      wide: true,
    },
  ],
  props: [
    { name: "className", type: "string", description: "Give it the height, width and radius of the content it replaces." },
    { name: "lines", type: "number", default: "3", description: "SkeletonText only. The last line is two-thirds wide." },
    { name: "cells", type: "number", default: "4", description: "SkeletonRow only. Number of cell placeholders." },
  ],
};
