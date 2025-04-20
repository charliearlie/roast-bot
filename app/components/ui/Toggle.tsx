import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/app/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center text-sm font-bold border-4 border-border transition-all hover:translate-y-[2px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-background hover:bg-secondary-background data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
        outline:
          "bg-background hover:bg-secondary-background data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
      },
      size: {
        default: "h-12 px-6",
        sm: "h-9 px-4",
        lg: "h-14 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof toggleVariants> {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
}

export function Toggle({
  className,
  variant,
  size,
  pressed,
  onPressedChange,
  children = pressed ? "Answer Prompts" : "Upload Selfie",
  ...props
}: ToggleProps) {
  return (
    <TogglePrimitive.Root
      pressed={pressed}
      onPressedChange={onPressedChange}
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </TogglePrimitive.Root>
  );
}
