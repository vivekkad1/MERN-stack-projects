export const mockProducts = [
  // Home Page - Bestsellers / Trending
  { id: '1', title: 'boAt Airdopes 141', desc: 'True Wireless Earbuds with 42H Playtime.', price: 1299, originalPrice: 2990, rating: 4.2, reviews: 3420, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=400&auto=format&fit=crop' },
  { id: '2', title: 'OnePlus Nord CE 3 Lite', desc: 'Pastel Lime, 8GB RAM, 128GB Storage, 108MP Camera.', price: 19999, originalPrice: 21999, rating: 4.8, reviews: 8900, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=400&auto=format&fit=crop' },
  { id: '3', title: 'Kanjivaram Silk Saree', desc: 'Authentic pure silk saree with zari border for festive wear.', price: 4599, originalPrice: 8999, rating: 4.7, reviews: 540, image: 'https://images.unsplash.com/photo-1610189013210-915003666d92?q=80&w=400&auto=format&fit=crop' },
  { id: '4', title: 'Pigeon Handy Mini Chopper', desc: 'Plastic Chopper with 3 Blades for daily kitchen use, Green.', price: 249, originalPrice: 495, rating: 4.5, reviews: 15000, image: 'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=400&auto=format&fit=crop' },
  
  // New Arrivals
  { id: '101', title: 'Sony WH-1000XM5', desc: 'Industry leading noise canceling headphones.', price: 29990, originalPrice: 34990, rating: 4.9, reviews: 2100, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400&auto=format&fit=crop' },
  { id: '102', title: 'Apple Watch Series 9', desc: 'Smarter, brighter, mightier.', price: 41900, originalPrice: 44900, rating: 4.8, reviews: 1540, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400&auto=format&fit=crop' },
  { id: '103', title: 'Samsung Galaxy S24 Ultra', desc: 'Galaxy AI is here.', price: 129999, originalPrice: 134999, rating: 4.9, reviews: 980, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400&auto=format&fit=crop' },
  { id: '104', title: 'Nike Air Max Pulse', desc: 'Mens shoes with iconic design.', price: 13995, originalPrice: 15995, rating: 4.7, reviews: 420, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop' },
  { id: '105', title: 'Dyson Airwrap', desc: 'Multi-styler Complete Long.', price: 45900, originalPrice: 49900, rating: 4.8, reviews: 890, image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=400&auto=format&fit=crop' },
  { id: '106', title: 'PlayStation 5 Slim', desc: 'Next-gen gaming console.', price: 44990, originalPrice: 49990, rating: 4.9, reviews: 4100, image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop' },
  { id: '107', title: 'Kindle Paperwhite', desc: 'Now with a 6.8" display and thinner borders.', price: 13999, originalPrice: 14999, rating: 4.6, reviews: 6700, image: 'https://images.unsplash.com/photo-1592496001020-d31bd830651f?q=80&w=400&auto=format&fit=crop' },
  { id: '108', title: 'Lego Star Wars Millennium Falcon', desc: 'Ultimate Collector Series.', price: 74999, originalPrice: 84999, rating: 4.9, reviews: 320, image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?q=80&w=400&auto=format&fit=crop' },

  // Deals
  { id: 'deal-1', title: 'Sony PS5 Console', desc: 'Next-gen gaming console with ultra-high speed SSD.', price: 44990, originalPrice: 49990, rating: 4.9, reviews: 4100, image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop' },
  { id: 'deal-2', title: 'Samsung 55" 4K Smart TV', desc: 'Crystal 4K UHD Smart TV with vivid colors.', price: 42990, originalPrice: 64990, rating: 4.6, reviews: 1240, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=400&auto=format&fit=crop' },

  // Categories - Mobiles (200s)
  { id: '201', title: 'iPhone 15 Pro Max', desc: 'Titanium design with A17 Pro chip.', price: 159900, originalPrice: 159900, rating: 4.8, reviews: 1240, image: 'https://images.unsplash.com/photo-1695048133142-1a20a5bf616f?q=80&w=400&auto=format&fit=crop' },
  { id: '202', title: 'Samsung Galaxy S24 Ultra', desc: 'Galaxy AI is here.', price: 129999, originalPrice: 134999, rating: 4.7, reviews: 980, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400&auto=format&fit=crop' },
  { id: '203', title: 'OnePlus 12 5G', desc: 'Smooth beyond belief.', price: 64999, originalPrice: 69999, rating: 4.6, reviews: 850, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=400&auto=format&fit=crop' },
  { id: '204', title: 'Google Pixel 8 Pro', desc: 'The pro Google phone.', price: 106999, originalPrice: 106999, rating: 4.5, reviews: 620, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=400&auto=format&fit=crop' },
  { id: '205', title: 'Nothing Phone (2)', desc: 'Come to the bright side.', price: 39999, originalPrice: 44999, rating: 4.4, reviews: 410, image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbc0?q=80&w=400&auto=format&fit=crop' },
  { id: '206', title: 'Xiaomi 14 Ultra', desc: 'Legendary photography.', price: 99999, originalPrice: 99999, rating: 4.7, reviews: 320, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=400&auto=format&fit=crop' },
  { id: '207', title: 'Vivo X100 Pro', price: 89999, originalPrice: 89999, desc: 'Pro photography.', rating: 4.6, reviews: 290, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=400&auto=format&fit=crop' },
  { id: '208', title: 'iQOO 12 5G', price: 52999, originalPrice: 52999, desc: 'Monster performance.', rating: 4.5, reviews: 510, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=400&auto=format&fit=crop' },

  // Categories - Fashion (300s)
  { id: '301', title: 'Men\'s Slim Fit Cotton Shirt', price: 899, originalPrice: 1499, desc: 'Comfortable everyday shirt.', rating: 4.2, reviews: 150, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400&auto=format&fit=crop' },
  { id: '302', title: 'Women\'s Floral Summer Dress', price: 1299, originalPrice: 2499, desc: 'Perfect for the summer.', rating: 4.5, reviews: 320, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=400&auto=format&fit=crop' },
  { id: '303', title: 'Classic Blue Denim Jeans', price: 1499, originalPrice: 2999, desc: 'Classic fit denim jeans.', rating: 4.4, reviews: 450, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400&auto=format&fit=crop' },
  { id: '304', title: 'Running Sneakers - Lightweight', price: 2499, originalPrice: 4999, desc: 'Lightweight and durable.', rating: 4.6, reviews: 890, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop' },
  { id: '305', title: 'Elegant Silk Saree', price: 4599, originalPrice: 8999, desc: 'Beautiful silk saree.', rating: 4.7, reviews: 210, image: 'https://images.unsplash.com/photo-1610189013210-915003666d92?q=80&w=400&auto=format&fit=crop' },
  { id: '306', title: 'Men\'s Leather Wallet', price: 599, originalPrice: 1299, desc: 'Genuine leather wallet.', rating: 4.3, reviews: 670, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=400&auto=format&fit=crop' },
  { id: '307', title: 'Oversized Cotton T-Shirt', price: 499, originalPrice: 999, desc: 'Oversized fit.', rating: 4.1, reviews: 880, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop' },
  { id: '308', title: 'Women\'s Ankle Boots', price: 2999, originalPrice: 5999, desc: 'Stylish ankle boots.', rating: 4.5, reviews: 340, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop' },

  // Categories - Home Appliances (400s)
  { id: '401', title: 'LG 8kg Fully Automatic Washing Machine', price: 34990, originalPrice: 42990, desc: 'Smart inverter technology.', rating: 4.6, reviews: 450, image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=400&auto=format&fit=crop' },
  { id: '402', title: 'Samsung 324L Frost Free Refrigerator', price: 29990, originalPrice: 38990, desc: 'Convertible 5in1.', rating: 4.5, reviews: 320, image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=400&auto=format&fit=crop' },
  { id: '403', title: 'Daikin 1.5 Ton Inverter AC', price: 37490, originalPrice: 52490, desc: 'PM 2.5 Filter.', rating: 4.4, reviews: 610, image: 'https://images.unsplash.com/photo-1585223067712-42173f4e2450?q=80&w=400&auto=format&fit=crop' },
  { id: '404', title: 'Philips 750W Mixer Grinder', price: 3499, originalPrice: 4499, desc: 'Powerful motor.', rating: 4.3, reviews: 1200, image: 'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=400&auto=format&fit=crop' },
  { id: '405', title: 'Eureka Forbes Water Purifier', price: 14999, originalPrice: 21999, desc: 'RO+UV+MTDS technology.', rating: 4.5, reviews: 890, image: 'https://images.unsplash.com/photo-1585223067712-42173f4e2450?q=80&w=400&auto=format&fit=crop' },
  { id: '406', title: 'Morphy Richards Microwave Oven', price: 6499, originalPrice: 8999, desc: '20L Solo.', rating: 4.2, reviews: 430, image: 'https://images.unsplash.com/photo-1585223067712-42173f4e2450?q=80&w=400&auto=format&fit=crop' },
  { id: '407', title: 'Havells 1200mm Ceiling Fan', price: 1899, originalPrice: 2899, desc: 'High speed fan.', rating: 4.1, reviews: 2100, image: 'https://images.unsplash.com/photo-1585223067712-42173f4e2450?q=80&w=400&auto=format&fit=crop' },
  { id: '408', title: 'Bajaj Dry Iron 1000W', price: 599, originalPrice: 899, desc: 'Non-stick coated.', rating: 4.4, reviews: 3500, image: 'https://images.unsplash.com/photo-1585223067712-42173f4e2450?q=80&w=400&auto=format&fit=crop' },

  // Categories - Electronics (500s)
  { id: '501', title: 'Apple MacBook Air M2', price: 114900, originalPrice: 114900, desc: 'Supercharged by M2.', rating: 4.8, reviews: 1540, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400&auto=format&fit=crop' },
  { id: '502', title: 'Sony WH-1000XM5 Headphones', price: 29990, originalPrice: 34990, desc: 'Industry leading noise canceling.', rating: 4.7, reviews: 2100, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400&auto=format&fit=crop' },
  { id: '503', title: 'iPad Pro 11-inch M4', price: 99900, originalPrice: 99900, desc: 'The ultimate iPad experience.', rating: 4.9, reviews: 850, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400&auto=format&fit=crop' },
  { id: '504', title: 'Samsung 55" 4K Smart TV', price: 42990, originalPrice: 64990, desc: 'Crystal 4K UHD.', rating: 4.6, reviews: 1240, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=400&auto=format&fit=crop' },
  { id: '505', title: 'Logitech MX Master 3S Mouse', price: 8995, originalPrice: 10995, desc: 'Advanced wireless mouse.', rating: 4.8, reviews: 3400, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=400&auto=format&fit=crop' },
  { id: '506', title: 'Sony PS5 Console', price: 44990, originalPrice: 49990, desc: 'Play Has No Limits.', rating: 4.9, reviews: 4100, image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop' },
  { id: '507', title: 'Canon EOS R5 Mirrorless Camera', price: 339990, originalPrice: 339990, desc: 'Professional mirrorless camera.', rating: 4.7, reviews: 280, image: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?q=80&w=400&auto=format&fit=crop' },
  { id: '508', title: 'JBL Charge 5 Bluetooth Speaker', price: 12999, originalPrice: 15999, desc: 'Portable waterproof speaker.', rating: 4.6, reviews: 1950, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=400&auto=format&fit=crop' }
];

export function getProductById(id: string) {
  const found = mockProducts.find(p => p.id === id);
  if (found) {
    return {
      id: found.id,
      title: found.title,
      price: found.price,
      originalPrice: found.originalPrice,
      rating: found.rating,
      reviews: found.reviews,
      description: found.desc || "Experience the best quality with this highly rated product, offering exceptional features and value.",
      features: [
        "Premium build quality and materials",
        "1 Year manufacturer warranty",
        "Easy 7-day return policy",
        "Free delivery on this item"
      ],
      images: [
        found.image,
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=600&auto=format&fit=crop"
      ]
    };
  }
  
  // Generic fallback for unknown IDs
  return {
    id: id,
    title: `Product ${id}`,
    price: 1000,
    originalPrice: 1500,
    rating: 4.0,
    reviews: 100,
    description: "Generic product description.",
    features: ["Standard feature 1", "Standard feature 2"],
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop"]
  };
}
