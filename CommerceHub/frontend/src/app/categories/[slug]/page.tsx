import { Button } from "@/components/ui/button";
import { Star, Filter, ArrowUpDown } from "lucide-react";
import Image from "next/image";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Format the slug for display (e.g. 'home-appliances' -> 'Home Appliances')
  const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  // Mock products for the category
  const products = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    title: `${title} Product ${i + 1}`,
    price: `₹${(Math.random() * 5000 + 500).toFixed(0)}`,
    rating: (Math.random() * 1 + 4).toFixed(1),
    reviews: Math.floor(Math.random() * 500 + 50),
  }));

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row gap-8 min-h-screen">
      
      {/* Sidebar Filters - Hidden on small screens, shown on md+ */}
      <aside className="w-full md:w-64 shrink-0 hidden md:flex flex-col gap-6">
        <div>
          <h2 className="font-bold text-lg mb-4">Filters</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-2 text-muted-foreground">Price Range</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  Under ₹1,000
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  ₹1,000 - ₹5,000
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  Over ₹5,000
                </label>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-sm mb-2 text-muted-foreground">Customer Rating</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  4 Stars & Up
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  3 Stars & Up
                </label>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground text-sm mt-1">Showing {products.length} results</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="md:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort: Featured
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group relative flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-lg transition-all">
              <div className="aspect-square bg-muted/40 relative overflow-hidden flex items-center justify-center p-4">
                <div className="w-full h-full rounded-md bg-muted animate-pulse" />
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="font-semibold line-clamp-2">{product.title}</h3>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-foreground">{product.rating}</span>
                  <span>({product.reviews})</span>
                </div>
                
                <div className="mt-auto pt-3 flex items-center justify-between">
                  <span className="text-lg font-bold">{product.price}</span>
                  <Button size="sm" variant="secondary">Add</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}
