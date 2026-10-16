import * as React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog, useConfirm } from "./confirm-dialog";

function Controlled(props: Partial<React.ComponentProps<typeof ConfirmDialog>>) {
  const [open, setOpen] = React.useState(true);
  return (
    <>
      <span data-testid="state">{open ? "open" : "closed"}</span>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete coil C-10422?"
        body="The coil and its history are removed from inventory."
        confirmLabel="Delete"
        onConfirm={() => {}}
        {...props}
      />
    </>
  );
}

describe("ConfirmDialog", () => {
  it("renders title, body and labelled buttons; danger tone by default", () => {
    render(<Controlled />);
    expect(screen.getByRole("dialog", { name: "Delete coil C-10422?" })).toBeInTheDocument();
    expect(screen.getByText(/removed from inventory/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("cancel closes without confirming", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<Controlled onConfirm={onConfirm} />);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByTestId("state")).toHaveTextContent("closed");
  });

  it("sync confirm calls onConfirm and closes", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<Controlled onConfirm={onConfirm} />);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("state")).toHaveTextContent("closed");
  });

  it("async confirm shows loading, then closes on resolve", async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    const onConfirm = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    render(<Controlled onConfirm={onConfirm} />);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled());
    expect(screen.getByTestId("state")).toHaveTextContent("open");
    await act(async () => resolve());
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("closed"));
  });

  it("stays open and surfaces the error on reject", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn(() => Promise.reject(new Error("Coil is on an active schedule")));
    render(<Controlled onConfirm={onConfirm} />);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Coil is on an active schedule");
    expect(screen.getByTestId("state")).toHaveTextContent("open");
    expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled();
  });

  it("type-to-confirm gates the confirm button", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<Controlled onConfirm={onConfirm} typeToConfirm="C-10422" />);
    const confirm = screen.getByRole("button", { name: "Delete" });
    expect(confirm).toBeDisabled();
    const input = screen.getByLabelText(/Type C-10422 to continue/);
    await user.type(input, "C-104");
    expect(confirm).toBeDisabled();
    await user.type(input, "22");
    expect(confirm).toBeEnabled();
    await user.keyboard("{Enter}");
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("accent tone renders a primary button", () => {
    render(<Controlled tone="accent" confirmLabel="Send" />);
    const btn = screen.getByRole("button", { name: "Send" });
    expect(btn).toBeInTheDocument();
    expect(btn.className).not.toMatch(/danger/);
  });
});

describe("useConfirm", () => {
  function Host({ onResult }: { onResult: (v: boolean) => void }) {
    const [confirm, dialog] = useConfirm();
    return (
      <>
        <button onClick={() => void confirm({ title: "Archive 3 orders?", confirmLabel: "Archive" }).then(onResult)}>
          Archive
        </button>
        {dialog}
      </>
    );
  }

  it("resolves true on confirm and false on cancel", async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();
    render(<Host onResult={onResult} />);
    await user.click(screen.getByRole("button", { name: "Archive" }));
    expect(await screen.findByRole("dialog", { name: "Archive 3 orders?" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Archive", hidden: false }).parentElement!.querySelector("button:last-child")!);
    await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(true));

    await user.click(screen.getByRole("button", { name: "Archive" }));
    await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(false));
  });
});
