import Link from "next/link"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card } from "@/components/card-component"
import { Button } from "@/components/ui/button"

export default function BrowsePage() {
  const categories = [
    { id: 1, name: "Engineering", depts: 5 },
    { id: 2, name: "Science", depts: 4 },
    { id: 3, name: "Commerce", depts: 3 },
    { id: 4, name: "Arts", depts: 6 },
  ]

  return (
    <LayoutWrapper breadcrumbs={[{ label: "Browse Materials" }]}>
      <section className="py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Browse by Category</h1>
          <p className="text-lg text-muted-foreground">Select a category to view all departments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.id}`}>
              <Card hoverable>
                <div className="flex flex-col gap-4">
                  <h2 className="text-2xl font-bold text-foreground">{category.name}</h2>
                  <p className="text-sm text-muted-foreground">{category.depts} departments</p>
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                    Explore
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </LayoutWrapper>
  )
}
