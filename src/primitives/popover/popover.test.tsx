import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "./popover";

describe("Popover", () => {
  it("opens on trigger click and renders content in a portal", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Filters</PopoverTrigger>
        <PopoverContent>Gauge range</PopoverContent>
      </Popover>,
    );
    expect(screen.queryByText("Gauge range")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Filters" }));
    const content = await screen.findByText("Gauge range");
    expect(content).toBeInTheDocument();
    expect(content.closest("[data-radix-popper-content-wrapper]")?.parentElement).toBe(document.body);
  });

  it("applies default chrome, merges className last and forwards ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent ref={ref} className="w-96" data-testid="content">
          Body
        </PopoverContent>
      </Popover>,
    );
    const el = screen.getByTestId("content");
    expect(ref.current).toBe(el);
    expect(el).toHaveClass("z-dropdown", "rounded-lg", "shadow-ls-2", "w-96");
    expect(el).not.toHaveClass("w-72");
  });

  it("closes on Escape and via PopoverClose", async () => {
    const user = userEvent.setup();
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          Body <PopoverClose>Done</PopoverClose>
        </PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByText("Body")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Body")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Body")).not.toBeInTheDocument();
  });
});
