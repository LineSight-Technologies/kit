import * as React from "react";
import { render, screen } from "@testing-library/react";
import { Avatar, AvatarStack, avatarToneFor, initialsFor } from "./avatar";

describe("helpers", () => {
  it("derives initials", () => {
    expect(initialsFor("Dana Whitfield")).toBe("DW");
    expect(initialsFor("acme")).toBe("A");
    expect(initialsFor("Mid-West Coil Processing")).toBe("MP");
    expect(initialsFor("  ")).toBe("");
  });

  it("tone is deterministic", () => {
    expect(avatarToneFor("Dana Whitfield")).toBe(avatarToneFor("Dana Whitfield"));
    expect(["accent", "info", "success", "warn", "danger"]).toContain(avatarToneFor("Line 2 operator"));
  });
});

describe("Avatar", () => {
  it("renders initials fallback with a tone, md circle by default", () => {
    const { container } = render(<Avatar name="Dana Whitfield" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("size-8", "rounded-full");
    expect(screen.getByText("DW")).toBeInTheDocument();
    expect(screen.getByText("DW").className).toMatch(/bg-(accent|info|success|warn|danger)-soft/);
  });

  it.each([
    ["xs", "size-5"],
    ["sm", "size-6"],
    ["md", "size-8"],
    ["lg", "size-10"],
  ] as const)("applies size %s", (size, cls) => {
    const { container } = render(<Avatar name="A B" size={size} />);
    expect(container.firstElementChild).toHaveClass(cls);
  });

  it("square shape for companies, with a building icon when no name", () => {
    const { container } = render(<Avatar shape="square" />);
    expect(container.firstElementChild).toHaveClass("rounded-md");
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders a person icon when there is no name and no src", () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("className wins and ref forwards", () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<Avatar ref={ref} name="A B" className="size-12" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toHaveClass("size-12");
    expect(ref.current).not.toHaveClass("size-8");
  });

  it("names the fallback for assistive tech", () => {
    render(<Avatar name="Dana Whitfield" />);
    expect(screen.getByLabelText("Dana Whitfield")).toBeInTheDocument();
  });
});

describe("AvatarStack", () => {
  it("overlaps, applies the stack size, and collapses the overflow into +N", () => {
    render(
      <AvatarStack max={2} size="sm">
        <Avatar name="A One" />
        <Avatar name="B Two" />
        <Avatar name="C Three" />
        <Avatar name="D Four" />
      </AvatarStack>,
    );
    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getByText("AO")).toBeInTheDocument();
    expect(screen.getByText("BT")).toBeInTheDocument();
    expect(screen.queryByText("CT")).not.toBeInTheDocument();
    const more = screen.getByLabelText("2 more");
    expect(more).toHaveTextContent("+2");
    expect(more).toHaveClass("size-6", "-ml-2", "ring-2");
    expect(screen.getByText("AO").parentElement).toHaveClass("size-6", "ring-2", "ring-surface");
  });

  it("renders no overflow chip when within max", () => {
    render(
      <AvatarStack>
        <Avatar name="A One" />
      </AvatarStack>,
    );
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });
});
