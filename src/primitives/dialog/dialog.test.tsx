import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";

function Demo(props: { size?: "sm" | "md" | "lg"; hideClose?: boolean; className?: string }) {
  return (
    <Dialog>
      <DialogTrigger>Edit coil</DialogTrigger>
      <DialogContent size={props.size} hideClose={props.hideClose} className={props.className} data-testid="content">
        <DialogHeader>
          <DialogTitle>Edit coil C-10422</DialogTitle>
        </DialogHeader>
        <DialogBody>Width and gauge</DialogBody>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("opens from the trigger with a dialog role named by the title", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole("button", { name: "Edit coil" }));
    const dialog = await screen.findByRole("dialog", { name: "Edit coil C-10422" });
    expect(dialog).toBeInTheDocument();
    expect(dialog).not.toHaveAttribute("aria-describedby");
    expect(document.body.contains(dialog)).toBe(true);
  });

  it("applies size classes and default md", () => {
    const { unmount } = render(
      <Dialog defaultOpen>
        <DialogContent data-testid="c">
          <DialogTitle>T</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByTestId("c")).toHaveClass("max-w-lg", "rounded-xl", "shadow-ls-3");
    unmount();
    render(
      <Dialog defaultOpen>
        <DialogContent size="lg" data-testid="c">
          <DialogTitle>T</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByTestId("c")).toHaveClass("max-w-2xl");
  });

  it("renders a Close control unless hideClose", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Demo />);
    await user.click(screen.getByRole("button", { name: "Edit coil" }));
    await user.click(await screen.findByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    unmount();
    render(
      <Dialog defaultOpen>
        <DialogContent hideClose>
          <DialogTitle>T</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("closes on Escape and via DialogClose", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole("button", { name: "Edit coil" }));
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Edit coil" }));
    await user.click(await screen.findByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("className wins and ref forwards", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Dialog defaultOpen>
        <DialogContent ref={ref} className="max-w-xs" data-testid="c">
          <DialogTitle>T</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(ref.current).toBe(screen.getByTestId("c"));
    expect(ref.current).toHaveClass("max-w-xs");
    expect(ref.current).not.toHaveClass("max-w-lg");
  });

  it("sections carry their padding", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader data-testid="h">
            <DialogTitle>T</DialogTitle>
          </DialogHeader>
          <DialogBody data-testid="b">B</DialogBody>
          <DialogFooter data-testid="f">F</DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByTestId("h")).toHaveClass("px-6", "pt-5", "pb-3");
    expect(screen.getByTestId("b")).toHaveClass("max-h-[70vh]", "overflow-y-auto");
    expect(screen.getByTestId("f")).toHaveClass("border-t", "bg-surface-2", "justify-end");
  });
});
