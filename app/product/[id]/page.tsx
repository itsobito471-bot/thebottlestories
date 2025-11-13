// app/product/[id]/page.tsx

export const dynamic = "force-dynamic"; // ⬅️ IMPORTANT for dynamic SSR

import Navbar from "@/components/Navbar"
import ProductView from "@/components/ProductView"
import Footer from "@/components/Footer"
import { getProductById } from "@/lib/appService"
import { Product } from "@/lib/types"
import { notFound } from "next/navigation"

export default async function ProductPage({ params }: { params: { id: string } }) {
  const productId = params.id;
  let product: Product;

  try {
    const res = await getProductById(productId); // Axios call = dynamic
    product = res;
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
  );
}
