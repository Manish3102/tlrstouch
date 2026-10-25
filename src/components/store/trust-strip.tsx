import { AnimatedSection } from "@/components/store/animated-section";

const DEFAULT_ITEMS = [
  {
    title: "Pan-India shipping",
    body: "Free delivery on orders over ₹2,999.",
  },
  {
    title: "Secure payments",
    body: "Encrypted checkout with trusted payment partners.",
  },
  {
    title: "Easy returns",
    body: "7-day returns on unworn pieces with tags.",
  },
  {
    title: "Support",
    body: "Write to us anytime — we reply within 24 hours.",
  },
];

export function TrustStrip({
  title,
  items,
}: {
  title?: string;
  items?: { title: string; body: string }[];
}) {
  const list = items?.length ? items : DEFAULT_ITEMS;

  return (
    <AnimatedSection className="border-y border-border py-14 sm:py-16">
      <div className="page-shell">
        {title ? (
          <p className="eyebrow mb-8 text-center">{title}</p>
        ) : null}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((item) => (
            <div key={item.title} className="text-center sm:text-left">
              <h3 className="text-sm font-medium tracking-wide text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
