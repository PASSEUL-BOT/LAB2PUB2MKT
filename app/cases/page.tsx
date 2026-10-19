import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { caseCategories, caseCards } from "@/lib/featured-cases";

export const metadata = { title: "Featured Cases · LAB2PUB" };

export default function CasesPage() {
  return (
    <>
      <Header title="Featured Cases 精選案例" description="Curated cases grouped by category 01–07." />

      <div className="flex flex-col gap-10">
        {caseCategories.map((category) => {
          const cards = caseCards.filter((c) => c.categoryNumber === category.number);
          return (
            <section key={category.number}>
              <div className="mb-3 flex items-baseline gap-3">
                <span className="font-serif text-xl font-semibold text-teal-dark">{category.number}</span>
                <div>
                  <h2 className="text-base font-semibold text-ink">{category.name ?? "（尚未命名）"}</h2>
                  {category.summary && <p className="text-sm text-slate">{category.summary}</p>}
                </div>
              </div>

              {cards.length === 0 ? (
                <p className="rounded-lg border border-dashed border-line px-4 py-6 text-sm text-slate">
                  尚無案例
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {cards.map((card) => (
                    <Card key={card.title}>
                      <CardHeader>
                        <div>
                          <CardTitle>{card.title}</CardTitle>
                          {card.subtitle && <p className="text-sm text-slate">{card.subtitle}</p>}
                        </div>
                      </CardHeader>
                      <p className="mb-3 text-sm text-ink">{card.description}</p>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {card.tags.map((tag) => (
                          <Badge key={tag} tone="active">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <a
                        href={card.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-teal hover:text-teal-dark"
                      >
                        Open case →
                      </a>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
