import { cn } from "@/lib/utils";

export function BrandStory({
  title,
  body,
  className,
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <section className={cn("bg-well py-20 sm:py-28", className)}>
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="eyebrow">The label</p>
        <h2 className="mt-4 font-display text-4xl leading-[1.08] tracking-tight text-foreground sm:text-6xl">
          {title}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          {body}
        </p>
      </div>
    </section>
  );
}
