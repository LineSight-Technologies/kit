"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { Building2, User } from "lucide-react";
import { cn } from "../../lib/cn";
import { toneSoft, type Tone } from "../../lib/tone";

export const avatarVariants = cva(
  "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden bg-surface-3 align-middle font-medium leading-none text-fg-2",
  {
    variants: {
      size: {
        xs: "size-5 text-[10px]",
        sm: "size-6 text-[11px]",
        md: "size-8 text-xs",
        lg: "size-10 text-sm",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-md",
      },
    },
    defaultVariants: { size: "md", shape: "circle" },
  },
);

export type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>["size"]>;
export type AvatarShape = NonNullable<VariantProps<typeof avatarVariants>["shape"]>;

const AVATAR_TONES: readonly Tone[] = ["accent", "info", "success", "warn", "danger"];

/** Same name, same colour, every time. */
export function avatarToneFor(name: string): Tone {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length] ?? "accent";
}

/** `"Dana Whitfield"` → `"DW"`, `"acme"` → `"A"`, `"Mid-West Coil Processing"` → `"MP"`. */
export function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0]?.charAt(0) ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.charAt(0) ?? "") : "";
  return (first + last).toUpperCase();
}

const iconSize: Record<AvatarSize, string> = { xs: "size-3", sm: "size-3.5", md: "size-4", lg: "size-5" };

interface StackContextValue {
  size: AvatarSize | null | undefined;
}
const StackContext = React.createContext<StackContextValue | null>(null);

export interface AvatarProps
  extends Omit<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>, "children">,
    VariantProps<typeof avatarVariants> {
  /** Person or company name. Drives the initials and the fallback colour. */
  name?: string;
  src?: string;
  /** Defaults to `name`. */
  alt?: string;
  /** Delay before the initials show while the image loads, in ms. Defaults to 300 when `src` is set, 0 otherwise. */
  delayMs?: number;
}

export const Avatar = React.forwardRef<React.ComponentRef<typeof AvatarPrimitive.Root>, AvatarProps>(
  ({ className, size, shape, name, src, alt, delayMs, ...props }, ref) => {
    const stack = React.useContext(StackContext);
    const resolvedSize = (size ?? stack?.size ?? "md") as AvatarSize;
    const resolvedShape = (shape ?? "circle") as AvatarShape;
    const initials = name ? initialsFor(name) : "";
    const tone = name ? toneSoft[avatarToneFor(name)] : undefined;
    const FallbackIcon = resolvedShape === "square" ? Building2 : User;

    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          avatarVariants({ size: resolvedSize, shape: resolvedShape }),
          stack && "-ml-2 ring-2 ring-surface first:ml-0",
          className,
        )}
        {...props}
      >
        {src ? <AvatarPrimitive.Image src={src} alt={alt ?? name ?? ""} className="size-full object-cover" /> : null}
        <AvatarPrimitive.Fallback
          delayMs={delayMs ?? (src ? 300 : 0)}
          className={cn("flex size-full items-center justify-center", tone)}
          aria-label={src ? undefined : (alt ?? name)}
        >
          {initials || <FallbackIcon aria-hidden="true" className={iconSize[resolvedSize]} />}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    );
  },
);
Avatar.displayName = "Avatar";

export interface AvatarStackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Avatars. Beyond `max`, the rest collapse into a “+N” chip. */
  children: React.ReactNode;
  max?: number;
  /** Applied to every avatar in the stack unless one sets its own. */
  size?: AvatarSize;
}

export const AvatarStack = React.forwardRef<HTMLDivElement, AvatarStackProps>(
  ({ className, children, max = 4, size = "md", ...props }, ref) => {
    const items = React.Children.toArray(children).filter(Boolean);
    const visible = items.slice(0, Math.max(0, max));
    const overflow = items.length - visible.length;
    const ctx = React.useMemo<StackContextValue>(() => ({ size }), [size]);

    return (
      <StackContext.Provider value={ctx}>
        <div ref={ref} role="group" className={cn("inline-flex items-center", className)} {...props}>
          {visible}
          {overflow > 0 ? (
            <span
              className={cn(
                avatarVariants({ size, shape: "circle" }),
                "-ml-2 bg-surface-3 text-fg-2 ring-2 ring-surface first:ml-0",
              )}
              aria-label={`${overflow} more`}
            >
              +{overflow}
            </span>
          ) : null}
        </div>
      </StackContext.Provider>
    );
  },
);
AvatarStack.displayName = "AvatarStack";
