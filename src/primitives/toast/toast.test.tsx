import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster, notify, toast } from "./toast";

// sonner's swipe handling calls pointer capture, which jsdom does not implement.
if (!Element.prototype.setPointerCapture) Element.prototype.setPointerCapture = () => {};

describe("Toast", () => {
  it("renders a region and shows a success toast with kit chrome", async () => {
    render(<Toaster />);
    act(() => {
      notify.success("Coil C-10422 archived");
    });
    const item = await screen.findByText("Coil C-10422 archived");
    expect(item).toBeInTheDocument();
    const li = item.closest("li");
    expect(li).toHaveClass("bg-surface", "border-line", "rounded-lg", "shadow-ls-3");
    expect(li?.querySelector("svg")).toBeInTheDocument();
  });

  it("renders an action and calls it", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Toaster />);
    act(() => {
      notify.success("3 orders archived", { action: { label: "Undo", onClick } });
    });
    await user.click(await screen.findByRole("button", { name: "Undo" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("error and loading toasts render", async () => {
    render(<Toaster />);
    act(() => {
      notify.error("Schedule failed");
      notify.loading("Generating schedule");
    });
    expect(await screen.findByText("Schedule failed")).toBeInTheDocument();
    expect(await screen.findByText("Generating schedule")).toBeInTheDocument();
  });

  it("promise toast moves from loading to success", async () => {
    render(<Toaster />);
    let resolve!: (v: number) => void;
    const p = new Promise<number>((r) => (resolve = r));
    act(() => {
      notify.promise(p, { loading: "Saving…", success: (n) => `Saved ${n} rows`, error: "Save failed" });
    });
    expect(await screen.findByText("Saving…")).toBeInTheDocument();
    await act(async () => {
      resolve(3);
      await p;
    });
    await waitFor(() => expect(screen.getByText("Saved 3 rows")).toBeInTheDocument());
  });

  it("re-exports sonner's toast", () => {
    expect(typeof toast).toBe("function");
    expect(typeof toast.dismiss).toBe("function");
  });
});
