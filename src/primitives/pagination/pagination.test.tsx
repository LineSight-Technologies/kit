import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "./pagination";

describe("Pagination", () => {
  it("renders the range text with grouped, tabular numbers", () => {
    render(<Pagination page={1} pageSize={25} total={1204} onPageChange={() => {}} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    const range = screen.getByText("1–25 of 1,204");
    expect(range).toHaveClass("tabular-nums");
  });

  it("clamps the last page's range and disables at the bounds", () => {
    const { unmount } = render(<Pagination page={49} pageSize={25} total={1204} onPageChange={() => {}} />);
    expect(screen.getByText("1,201–1,204 of 1,204")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();
    unmount();
    render(<Pagination page={1} pageSize={25} total={10} onPageChange={() => {}} />);
    expect(screen.getByText("1–10 of 10")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("empty total reads 0 results", () => {
    render(<Pagination page={1} pageSize={25} total={0} onPageChange={() => {}} />);
    expect(screen.getByText("0 results")).toBeInTheDocument();
  });

  it("prev/next call onPageChange with the neighbouring page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={3} pageSize={25} total={1204} onPageChange={onPageChange} />);
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
    await user.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
  });

  it("page-size select renders only with onPageSizeChange and uses the options", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Pagination page={1} pageSize={25} total={100} onPageChange={() => {}} />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    unmount();
    const onPageSizeChange = vi.fn();
    render(<Pagination page={1} pageSize={25} total={100} onPageChange={() => {}} onPageSizeChange={onPageSizeChange} />);
    const select = screen.getByRole("combobox", { name: "Rows per page" });
    expect(select).toHaveValue("25");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["25 per page", "50 per page", "100 per page"]);
    await user.selectOptions(select, "50");
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });

  it("className wins and ref forwards", () => {
    const ref = React.createRef<HTMLElement>();
    render(<Pagination ref={ref} className="justify-start" page={1} pageSize={25} total={1} onPageChange={() => {}} />);
    expect(ref.current).toHaveClass("justify-start");
    expect(ref.current).not.toHaveClass("justify-between");
  });
});
