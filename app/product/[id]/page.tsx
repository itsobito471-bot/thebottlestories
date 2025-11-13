// app/product/[id]/page.tsx
import Navbar from "@/components/Navbar"
import ProductView from "@/components/ProductView"
import Footer from "@/components/Footer"
// --- 1. Import BOTH functions ---
import { getProductById, getAllProductIds } from "@/lib/appService" 
import { Product } from "@/lib/types"
import { notFound } from "next/navigation"

// --- 2. ADD THIS FUNCTION BACK ---
export async function generateStaticParams() {
  try {
    // This runs at BUILD TIME
    const ids = await getAllProductIds(); // Fetches all IDs from your API
    
    // Returns an array like: [ { id: '123' }, { id: '456' } ]
    return ids.map((id: string) => ({
      id: id.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch product IDs for generateStaticParams:", error);
    // If API is down during build, build no pages
    return [];
  }
}
// --- END OF NEW FUNCTION ---

export default async function ProductPage({ params }: { params: { id: string } }) {
  const productId = params.id
  let product: Product;

  try {
    // This now runs AT BUILD TIME for each ID
    product = await getProductById(productId);
    console.log("Fetched product for ID:", productId, product);
  } catch (error) {
    console.error("Failed to fetch product:", error);
    notFound();
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <ProductView product={product} />
      <Footer />
    </main>
  )
}