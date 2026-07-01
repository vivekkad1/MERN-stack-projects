import Link from "next/link";
import { Button } from "@/components/ui/button";
import { mockProducts } from "@/lib/mockData";
import { Star, Filter, ArrowUpDown } from "lucide-react";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Format the slug for display (e.g. 'home-appliances' -> 'Home Appliances')
  const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  // Diverse fallback images for mock data
  const fallbackImages = [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop", // Headphones
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop", // Watch
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=400&auto=format&fit=crop", // Camera
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop", // Shoes
    "https://images.unsplash.com/photo-1572569531935-c2eec7ebcc79?q=80&w=400&auto=format&fit=crop", // Backpack
    "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400&auto=format&fit=crop", // Headphones 2
    "https://images.unsplash.com/photo-1585386959920-141b015f8342?q=80&w=400&auto=format&fit=crop", // Smartphone
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=400&auto=format&fit=crop"  // Smartwatch
  ];

  const getProductsBySlug = (slug: string) => {
    switch (slug) {
      case 'mobiles': return mockProducts.filter(p => p.id.startsWith('20'));
      case 'fashion': return mockProducts.filter(p => p.id.startsWith('30'));
      case 'home-appliances': return mockProducts.filter(p => p.id.startsWith('40'));
      case 'electronics': return mockProducts.filter(p => p.id.startsWith('50'));
      default: return Array.from({ length: 8 }).map((_, i) => ({
        id: `mock-${i + 1}`,
        title: `${title} Product ${i + 1}`,
        price: 5000 + i * 500,
        rating: 4 + (i % 5) * 0.2,
        reviews: 50 + i * 15,
        image: fallbackImages[i % fallbackImages.length]
      }));
    }
  };

  const products = getProductsBySlug(slug);

  // Mock products for the category


  const subcategoryMap: Record<string, { name: string; color: string; isSpecial?: boolean }[]> = {
    fashion: [
      { name: "Thunder deals", color: "bg-red-600 rounded-full", isSpecial: true },
      { name: "Tshirts", color: "bg-amber-100 rounded-2xl" },
      { name: "Jeans", color: "bg-amber-100 rounded-2xl" },
      { name: "Sports Shoes", color: "bg-amber-100 rounded-2xl" },
      { name: "Watches", color: "bg-amber-100 rounded-2xl" },
      { name: "Kids' clothing", color: "bg-amber-100 rounded-2xl" },
      { name: "Luggage", color: "bg-amber-100 rounded-2xl" },
      { name: "Kurtas..", color: "bg-orange-100 rounded-2xl" },
      { name: "Trunk, Vests", color: "bg-amber-100 rounded-2xl" },
      { name: "Summer Wear", color: "bg-amber-100 rounded-2xl" },
      { name: "Sports", color: "bg-amber-100 rounded-2xl" },
      { name: "Trends", color: "bg-orange-100 rounded-2xl" },
      { name: "Kurta sets", color: "bg-orange-100 rounded-2xl" },
      { name: "Dresses, Co-ords", color: "bg-orange-100 rounded-2xl" },
      { name: "Casual shoes", color: "bg-orange-100 rounded-2xl" },
      { name: "Backpacks", color: "bg-orange-100 rounded-2xl" },
      { name: "Jewellery", color: "bg-orange-100 rounded-2xl" },
      { name: "Sarees", color: "bg-orange-100 rounded-2xl" },
      { name: "Jeans,trousers", color: "bg-orange-100 rounded-2xl" },
      { name: "Kurtis", color: "bg-orange-100 rounded-2xl" },
      { name: "Nightsuits", color: "bg-orange-100 rounded-2xl" },
    ],
    mobiles: [
      { name: "Best Sellers", color: "bg-red-600 rounded-full", isSpecial: true },
      { name: "Apple", color: "bg-blue-50 rounded-2xl" },
      { name: "Samsung", color: "bg-blue-50 rounded-2xl" },
      { name: "OnePlus", color: "bg-blue-50 rounded-2xl" },
      { name: "Xiaomi", color: "bg-blue-50 rounded-2xl" },
      { name: "Vivo", color: "bg-blue-50 rounded-2xl" },
      { name: "Oppo", color: "bg-blue-50 rounded-2xl" },
      { name: "Realme", color: "bg-blue-50 rounded-2xl" },
      { name: "Motorola", color: "bg-blue-50 rounded-2xl" },
      { name: "Google Pixel", color: "bg-blue-50 rounded-2xl" },
      { name: "Nothing", color: "bg-blue-50 rounded-2xl" },
      { name: "Poco", color: "bg-blue-50 rounded-2xl" },
    ],
    'home-appliances': [
      { name: "Top Offers", color: "bg-red-600 rounded-full", isSpecial: true },
      { name: "Televisions", color: "bg-teal-50 rounded-2xl" },
      { name: "Refrigerators", color: "bg-teal-50 rounded-2xl" },
      { name: "Washing Machines", color: "bg-teal-50 rounded-2xl" },
      { name: "Air Conditioners", color: "bg-teal-50 rounded-2xl" },
      { name: "Microwaves", color: "bg-teal-50 rounded-2xl" },
      { name: "Water Purifiers", color: "bg-teal-50 rounded-2xl" },
      { name: "Fans", color: "bg-teal-50 rounded-2xl" },
      { name: "Iron", color: "bg-teal-50 rounded-2xl" },
      { name: "Vacuum Cleaners", color: "bg-teal-50 rounded-2xl" },
      { name: "Mixers", color: "bg-teal-50 rounded-2xl" },
    ],
    beauty: [
      { name: "Hot Deals", color: "bg-red-600 rounded-full", isSpecial: true },
      { name: "Makeup", color: "bg-pink-50 rounded-2xl" },
      { name: "Skincare", color: "bg-pink-50 rounded-2xl" },
      { name: "Haircare", color: "bg-pink-50 rounded-2xl" },
      { name: "Fragrances", color: "bg-pink-50 rounded-2xl" },
      { name: "Bath & Body", color: "bg-pink-50 rounded-2xl" },
      { name: "Men's Grooming", color: "bg-pink-50 rounded-2xl" },
      { name: "Tools", color: "bg-pink-50 rounded-2xl" },
      { name: "Wellness", color: "bg-pink-50 rounded-2xl" },
    ],
    groceries: [
      { name: "Super Savers", color: "bg-red-600 rounded-full", isSpecial: true },
      { name: "Fresh Fruits", color: "bg-green-50 rounded-2xl" },
      { name: "Vegetables", color: "bg-green-50 rounded-2xl" },
      { name: "Dairy", color: "bg-green-50 rounded-2xl" },
      { name: "Staples", color: "bg-green-50 rounded-2xl" },
      { name: "Snacks", color: "bg-green-50 rounded-2xl" },
      { name: "Beverages", color: "bg-green-50 rounded-2xl" },
      { name: "Packaged Food", color: "bg-green-50 rounded-2xl" },
      { name: "Personal Care", color: "bg-green-50 rounded-2xl" },
      { name: "Household Care", color: "bg-green-50 rounded-2xl" },
    ],
    electronics: [
      { name: "Bestsellers", color: "bg-red-600 rounded-full", isSpecial: true },
      { name: "Laptops", color: "bg-indigo-50 rounded-2xl" },
      { name: "Tablets", color: "bg-indigo-50 rounded-2xl" },
      { name: "Smartwatches", color: "bg-indigo-50 rounded-2xl" },
      { name: "Audio", color: "bg-indigo-50 rounded-2xl" },
      { name: "Cameras", color: "bg-indigo-50 rounded-2xl" },
      { name: "Printers", color: "bg-indigo-50 rounded-2xl" },
      { name: "Monitors", color: "bg-indigo-50 rounded-2xl" },
      { name: "Gaming", color: "bg-indigo-50 rounded-2xl" },
      { name: "Accessories", color: "bg-indigo-50 rounded-2xl" },
    ],
    watches: [
      { name: "Flash Sale", color: "bg-red-600 rounded-full", isSpecial: true },
      { name: "Smartwatches", color: "bg-slate-100 rounded-2xl" },
      { name: "Analog", color: "bg-slate-100 rounded-2xl" },
      { name: "Digital", color: "bg-slate-100 rounded-2xl" },
      { name: "Men's Watches", color: "bg-slate-100 rounded-2xl" },
      { name: "Women's Watches", color: "bg-slate-100 rounded-2xl" },
      { name: "Kids' Watches", color: "bg-slate-100 rounded-2xl" },
      { name: "Luxury", color: "bg-slate-100 rounded-2xl" },
      { name: "Straps", color: "bg-slate-100 rounded-2xl" },
    ],
    books: [
      { name: "Must Reads", color: "bg-red-600 rounded-full", isSpecial: true },
      { name: "Fiction", color: "bg-amber-50 rounded-2xl" },
      { name: "Non-Fiction", color: "bg-amber-50 rounded-2xl" },
      { name: "Educational", color: "bg-amber-50 rounded-2xl" },
      { name: "Children's", color: "bg-amber-50 rounded-2xl" },
      { name: "Self-Help", color: "bg-amber-50 rounded-2xl" },
      { name: "Biographies", color: "bg-amber-50 rounded-2xl" },
      { name: "Comics & Mangas", color: "bg-amber-50 rounded-2xl" },
      { name: "Exam Prep", color: "bg-amber-50 rounded-2xl" },
    ],
    sports: [
      { name: "Top Picks", color: "bg-red-600 rounded-full", isSpecial: true },
      { name: "Cricket", color: "bg-red-50 rounded-2xl" },
      { name: "Football", color: "bg-red-50 rounded-2xl" },
      { name: "Badminton", color: "bg-red-50 rounded-2xl" },
      { name: "Fitness", color: "bg-red-50 rounded-2xl" },
      { name: "Cycling", color: "bg-red-50 rounded-2xl" },
      { name: "Yoga", color: "bg-red-50 rounded-2xl" },
      { name: "Swimming", color: "bg-red-50 rounded-2xl" },
      { name: "Shoes", color: "bg-red-50 rounded-2xl" },
      { name: "Apparel", color: "bg-red-50 rounded-2xl" },
    ],
    music: [
      { name: "Bestsellers", color: "bg-red-600 rounded-full", isSpecial: true },
      { name: "Guitars", color: "bg-purple-50 rounded-2xl" },
      { name: "Keyboards", color: "bg-purple-50 rounded-2xl" },
      { name: "Drums", color: "bg-purple-50 rounded-2xl" },
      { name: "Violins", color: "bg-purple-50 rounded-2xl" },
      { name: "Wind Instruments", color: "bg-purple-50 rounded-2xl" },
      { name: "DJ Equipment", color: "bg-purple-50 rounded-2xl" },
      { name: "Studio Gear", color: "bg-purple-50 rounded-2xl" },
      { name: "Microphones", color: "bg-purple-50 rounded-2xl" },
      { name: "Accessories", color: "bg-purple-50 rounded-2xl" },
    ]
  };

  const currentSubcategories = subcategoryMap[slug] || [];

  return (
    <div className="flex flex-col min-h-screen">
      {currentSubcategories.length > 0 && (
        <div className="container mx-auto px-4 md:px-6 pt-6 pb-2">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-x-4 gap-y-6">
            {currentSubcategories.map((sub, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 cursor-pointer group">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 ${sub.color} flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-shadow`}>
                  {sub.isSpecial ? (
                    <span className="text-white font-bold text-center text-xs px-1 leading-tight uppercase transform -rotate-12">
                      {sub.name.split(' ').map((word, i) => <span key={i}>{word}<br/></span>)}
                    </span>
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/5 rounded-md" />
                  )}
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-center text-muted-foreground group-hover:text-foreground line-clamp-1 px-1">
                  {sub.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row gap-8">
      
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
              <Link href={`/product/${product.id}`} className="aspect-square bg-muted/40 relative overflow-hidden flex items-center justify-center p-4">
                <img src={product.image} alt={product.title} className="absolute inset-0 w-full h-full object-cover" />
              </Link>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <Link href={`/product/${product.id}`} className="before:absolute before:inset-0">
                  <h3 className="font-semibold line-clamp-2">{product.title}</h3>
                </Link>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-foreground">{product.rating}</span>
                  <span>({product.reviews})</span>
                </div>
                
                <div className="mt-auto pt-3 flex items-center justify-between">
                  <span className="text-lg font-bold">
                    {typeof product.price === 'number' ? `₹${product.price.toLocaleString('en-IN')}` : product.price}
                  </span>
                  <div className="relative z-10">
                    <Button size="sm" variant="secondary">Add</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      </div>
    </div>
  );
}
