// app/product/[id]/page.tsx
import Navbar from "@/components/Navbar"
import ProductView from "@/components/ProductView"
import Footer from "@/components/Footer"
import { getAllProductIds } from "@/lib/products"

export async function generateStaticParams() {
  const ids = await getAllProductIds() // e.g., [1, 2, 3]
  return ids.map((id:any) => ({ id: id.toString() }))
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const productId = params.id

  return (
    <main className="min-h-screen">
      <Navbar />
      <ProductView productId={productId} />
      <Footer />
    </main>
  )
}
