import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sheet, SheetBody, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTrigger } from "./sheet";

function Demo(props: Partial<React.ComponentProps<typeof SheetContent>>) {
  return (
    <Sheet>
      <SheetTrigger>Peek</SheetTrigger>
      <SheetContent data-testid="content" {...props}>
        <SheetHeader title="Coil C-10422" actions={<span>Available</span>} />
        <SheetBody>48.000 in × 0.0598 in</SheetBody>
        <SheetFooter>
          <SheetClose>Done</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

describe("Sheet", () => {
  it("opens from the trigger, named by the header title, with actions and a Close control", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole("button", { name: "Peek" }));
    const dialog = await screen.findByRole("dialog", { name: "Coil C-10422" });
    expect(dialog).toHaveAttribute("data-side", "right");
    expect(dialog).not.toHaveAttribute("aria-describedby");
    expect(screen.getByText("Available")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("defaults to right / md and applies side + size variants", () => {
    const first = render(
      <Sheet defaultOpen>
        <SheetContent data-testid="c">
          <SheetHeader title="T" />
        </SheetContent>
      </Sheet>,
    );
    let el = screen.getByTestId("c");
    expect(el).toHaveClass("right-0", "border-l", "sm:w-[520px]", "z-sheet", "shadow-ls-3", "flex-col");
    first.unmount();
    const second = render(
      <Sheet defaultOpen>
        <SheetContent side="left" size="xl" data-testid="c">
          <SheetHeader title="T" />
        </SheetContent>
      </Sheet>,
    );
    el = screen.getByTestId("c");
    expect(el).toHaveClass("left-0", "border-r", "sm:w-[960px]", "data-[state=open]:animate-ls-slide-in-left");
    second.unmount();
    render(
      <Sheet defaultOpen>
        <SheetContent side="bottom" data-testid="c">
          <SheetHeader title="T" />
        </SheetContent>
      </Sheet>,
    );
    el = screen.getByTestId("c");
    expect(el).toHaveClass("bottom-0", "border-t", "max-h-[85vh]");
    expect(el.className).not.toMatch(/sm:w-/);
  });

  it("closes on Escape and via SheetClose in the footer", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole("button", { name: "Peek" }));
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Peek" }));
    await user.click(await screen.findByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("body scrolls and footer sits last; className wins; ref forwards", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Sheet defaultOpen>
        <SheetContent ref={ref} className="sm:w-[300px]" data-testid="c">
          <SheetHeader title="T" hideClose data-testid="h" />
          <SheetBody data-testid="b">B</SheetBody>
          <SheetFooter data-testid="f">F</SheetFooter>
        </SheetContent>
      </Sheet>,
    );
    expect(ref.current).toBe(screen.getByTestId("c"));
    expect(ref.current).toHaveClass("sm:w-[300px]");
    expect(ref.current).not.toHaveClass("sm:w-[520px]");
    expect(screen.getByTestId("h")).toHaveClass("border-b", "px-6", "py-4");
    expect(screen.getByTestId("b")).toHaveClass("flex-1", "overflow-y-auto");
    expect(screen.getByTestId("f")).toHaveClass("border-t", "bg-surface-2");
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });
});
