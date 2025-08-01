import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-black/10 bg-gradient-to-b from-primary to-[hsl(var(--primary)_/_0.9)] text-primary-foreground shadow-[0_1px_0_hsl(var(--primary-foreground)/0.2)_inset,0_1px_3px_rgba(0,0,0,0.2)] active:shadow-[0_1px_2px_rgba(0,0,0,0.3)_inset] hover:brightness-105 active:brightness-95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent shadow-[0_1px_0_hsl(var(--primary-foreground)/0.1)_inset,0_1px_2px_rgba(0,0,0,0.1)] active:shadow-[0_1px_1px_rgba(0,0,0,0.2)_inset] hover:bg-accent hover:text-accent-foreground",
        secondary:
          "border border-black/10 bg-gradient-to-b from-secondary to-[hsl(var(--secondary)_/_0.8)] text-secondary-foreground shadow-[0_1px_0_hsl(var(--primary-foreground)/0.1)_inset,0_1px_2px_rgba(0,0,0,0.1)] active:shadow-[0_1px_1px_rgba(0,0,0,0.2)_inset] hover:brightness-105 active:brightness-95",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-10 rounded-md px-3",
        lg: "h-12 rounded-md px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
