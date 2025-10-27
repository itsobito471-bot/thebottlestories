// lib/products.ts
import productsData from "@/data/products.json"  // your JSON file

export function getAllProductIds() {
  return productsData.map((product:any) => product.id)  // returns an array of IDs
}

export function getProductById(id: string) {
  return productsData.find(product => product.id === id)
}