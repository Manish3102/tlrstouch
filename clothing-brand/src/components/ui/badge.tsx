import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center font-sans text-[10px] font-medium uppercase tracking-[0.16em]",
  {
    variants: {
      variant: {
        default: "bg-neutral-900 text-white px-2 py-0.5",
        outline: "border border-neutral-900 text-neutral-900 px-2 py-0.5",
        muted: "bg-neutral-100 text-neutral-600 px-2 py-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
