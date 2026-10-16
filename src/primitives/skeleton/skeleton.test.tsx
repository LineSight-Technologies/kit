import * as React from "react";
import { render } from "@testing-library/react";
import { Skeleton, SkeletonRow, SkeletonText, SkeletonTile } from "./skeleton";

describe("Skeleton", () => {
  it("renders an aria-hidden block with a shimmer overlay", () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).toHaveClass("bg-surface-3", "rounded-md", "h-4", "w-32");
    expect(el.firstElementChild).toHaveClass("animate-ls-shimmer");
  });

  it("className wins and ref forwards", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} className="rounded-full" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("rounded-full");
    expect(ref.current).not.toHaveClass("rounded-md");
  });

  it("SkeletonText renders N lines with a shorter last line", () => {
    const { container } = render(<SkeletonText lines={4} />);
    const lines = container.querySelectorAll(":scope > div > div");
    expect(lines).toHaveLength(4);
    expect(lines[3]).toHaveClass("w-2/3");
    expect(lines[0]).toHaveClass("w-full");
  });

  it("SkeletonText with one line keeps it full width", () => {
    const { container } = render(<SkeletonText lines={1} />);
    expect(container.querySelector(":scope > div > div")).toHaveClass("w-full");
  });

  it("SkeletonRow is row shaped with N cells", () => {
    const { container } = render(<SkeletonRow cells={5} />);
    const row = container.firstElementChild as HTMLElement;
    expect(row).toHaveClass("h-12", "border-b");
    expect(row.children).toHaveLength(5);
  });

  it("SkeletonTile is a framed tile with two bars", () => {
    const { container } = render(<SkeletonTile />);
    const tile = container.firstElementChild as HTMLElement;
    expect(tile).toHaveClass("rounded-lg", "border-line", "shadow-ls-1");
    expect(tile).toHaveAttribute("aria-hidden", "true");
    expect(tile.children).toHaveLength(2);
  });
});
