import Link from "next/link";
import type { HTMLAttributeAnchorTarget, MouseEventHandler, ReactNode } from "react";
import { cx } from "./shared";

export type DirtyButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
  className?: string;
  href?: string;
  target?: HTMLAttributeAnchorTarget;
  rel?: string;
  title?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  "aria-label"?: string;
};

const variantClasses = {
  primary:
    "border-dirty-red bg-dirty-red text-dirty-black hover:border-dirty-yellow hover:bg-dirty-yellow focus-visible:border-dirty-yellow focus-visible:bg-dirty-yellow",
  secondary:
    "border-dirty-yellow bg-dirty-yellow/10 text-dirty-yellow hover:border-dirty-red hover:bg-dirty-red/15 focus-visible:border-dirty-red focus-visible:bg-dirty-red/15",
  ghost:
    "border-[rgba(183,178,168,0.36)] bg-dirty-black/35 text-dirty-ash hover:border-dirty-yellow hover:bg-dirty-yellow/10 hover:text-dirty-yellow focus-visible:border-dirty-yellow"
};

export function DirtyButton(props: DirtyButtonProps) {
  const {
    children,
    variant = "primary",
    fullWidth = false,
    className,
    href,
    target,
    rel,
    title,
    type = "button",
    disabled,
    onClick,
    "aria-label": ariaLabel
  } = props;
  const classes = cx(
    "inline-flex min-h-12 items-center justify-center border-2 px-4 py-3 font-utility text-sm font-black uppercase leading-none no-underline transition-colors",
    "shadow-[0.25rem_0.25rem_0_rgba(0,0,0,0.38)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
    fullWidth && "w-full",
    variantClasses[variant],
    className
  );

  if (href) {
    return (
      <Link
        aria-label={ariaLabel}
        className={classes}
        href={href}
        rel={rel}
        target={target}
        title={title}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      aria-label={ariaLabel}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      title={title}
      type={type}
    >
      {children}
    </button>
  );
}
