import Image from "next/image";
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn, formatCurrency } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "accent";
type ButtonSize = "sm" | "md" | "lg";

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md") {
  return cn(
    "inline-flex items-center justify-center gap-2 font-semibold uppercase tracking-[0.08em] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    size === "sm" && "h-9 px-3 text-[11px]",
    size === "md" && "h-11 px-5 text-xs",
    size === "lg" && "h-14 px-8 text-sm",
    variant === "primary" && "bg-ink text-white hover:bg-black/80",
    variant === "accent" && "bg-accent text-white hover:bg-accent-ink",
    variant === "secondary" && "border border-ink bg-transparent text-ink hover:bg-ink hover:text-white",
    variant === "ghost" && "text-ink underline-offset-4 hover:underline",
  );
}

export const Button = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button"> & { variant?: ButtonVariant; size?: ButtonSize }
>(function Button({ variant, size, className, type = "button", ...props }, ref) {
  return <button ref={ref} type={type} className={cn(buttonClasses(variant, size), className)} {...props} />;
});

const fieldBase =
  "h-11 w-full border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-ink focus:outline-none aria-[invalid=true]:border-danger";

export const Input = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<"input">>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(fieldBase, className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, ComponentPropsWithoutRef<"select">>(function Select(
  { className, ...props },
  ref,
) {
  return <select ref={ref} className={cn(fieldBase, "pr-8", className)} {...props} />;
});

export function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="label block text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "danger" | "ink";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-label",
        tone === "neutral" && "bg-line/60 text-ink",
        tone === "accent" && "bg-accent text-white",
        tone === "success" && "bg-success/10 text-success",
        tone === "danger" && "bg-danger/10 text-danger",
        tone === "ink" && "bg-ink text-white",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Price({ amount, className }: { amount: number; className?: string }) {
  return <span className={cn("tabular-nums", className)}>{formatCurrency(amount)}</span>;
}

const OPTIMIZED_HOSTS = ["images.unsplash.com"];

/** next/image for known hosts; plain <img> for others (e.g. Printrove CDN) so unknown hosts never crash a page. */
export function ProductImage({
  src,
  alt,
  sizes,
  priority,
  className,
  fit = "cover",
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  fit?: "cover" | "contain";
}) {
  const fitClass = fit === "cover" ? "object-cover" : "object-contain";
  let optimized = false;
  try {
    optimized = OPTIMIZED_HOSTS.includes(new URL(src).hostname);
  } catch {
    optimized = false;
  }
  if (optimized) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn(fitClass, className)} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      className={cn("absolute inset-0 h-full w-full", fitClass, className)}
    />
  );
}
