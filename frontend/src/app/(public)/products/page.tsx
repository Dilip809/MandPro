
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  description: string;
  emoji: string;
  color: string;
};

const products: Product[] = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    category: "Vegetables",
    price: 30,
    unit: "kg",
    stock: 120,
    description: "Farm-fresh, ripe red tomatoes.",
    emoji: "🍅",
    color: "bg-red-50",
  },
  {
    id: 2,
    name: "Fresh Potatoes",
    category: "Vegetables",
    price: 25,
    unit: "kg",
    stock: 250,
    description: "Quality potatoes for everyday cooking.",
    emoji: "🥔",
    color: "bg-amber-50",
  },
  {
    id: 3,
    name: "Red Onions",
    category: "Vegetables",
    price: 35,
    unit: "kg",
    stock: 180,
    description: "Fresh onions sourced from local farms.",
    emoji: "🧅",
    color: "bg-purple-50",
  },
  {
    id: 4,
    name: "Fresh Bananas",
    category: "Fruits",
    price: 45,
    unit: "dozen",
    stock: 90,
    description: "Naturally ripened, sweet bananas.",
    emoji: "🍌",
    color: "bg-yellow-50",
  },
  {
    id: 5,
    name: "Fresh Apples",
    category: "Fruits",
    price: 140,
    unit: "kg",
    stock: 65,
    description: "Crisp apples selected for quality.",
    emoji: "🍎",
    color: "bg-rose-50",
  },
  {
    id: 6,
    name: "Green Capsicum",
    category: "Vegetables",
    price: 55,
    unit: "kg",
    stock: 75,
    description: "Fresh green capsicum for kitchens.",
    emoji: "🫑",
    color: "bg-green-50",
  },
  {
    id: 7,
    name: "Fresh Carrots",
    category: "Vegetables",
    price: 40,
    unit: "kg",
    stock: 100,
    description: "Crunchy carrots, packed with freshness.",
    emoji: "🥕",
    color: "bg-orange-50",
  },
  {
    id: 8,
    name: "Fresh Mangoes",
    category: "Fruits",
    price: 100,
    unit: "kg",
    stock: 40,
    description: "Sweet seasonal mangoes.",
    emoji: "🥭",
    color: "bg-orange-50",
  },
];

const categories = ["All", "Vegetables", "Fruits"];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [cart, setCart] = useState<Record<number, number>>({});

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [search, category, sort]);

  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0
  );

  const cartTotal = products.reduce(
    (total, product) =>
      total + product.price * (cart[product.id] ?? 0),
    0
  );

  function addToCart(product: Product) {
    setCart((current) => ({
      ...current,
      [product.id]: (current[product.id] ?? 0) + 1,
    }));
  }

  function changeQuantity(productId: number, amount: number) {
    setCart((current) => {
      const next = { ...current };
      const quantity = (next[productId] ?? 0) + amount;

      if (quantity <= 0) {
        delete next[productId];
      } else {
        next[productId] = quantity;
      }

      return next;
    });
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Page heading */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Freshness delivered
          </p>

          <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Fresh Products
              </h1>
              <p className="mt-3 max-w-xl text-text-muted">
                Discover quality fruits and vegetables for your home,
                restaurant, or wholesale business.
              </p>
            </div>

            <div className="rounded-xl border border-border px-4 py-3">
              <p className="text-sm text-text-muted">Your cart</p>
              <p className="mt-1 font-semibold">
                {cartCount} items · ₹{cartTotal.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        {/* Search and filters */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <label htmlFor="product-search" className="sr-only">
              Search products
            </label>
            <input
              id="product-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tomatoes, apples, vegetables..."
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  category === item
                    ? "bg-primary text-white"
                    : "border border-border bg-surface text-text-muted hover:text-foreground"
                }`}
              >
                {item}
              </button>
            ))}

            <label htmlFor="product-sort" className="sr-only">
              Sort products
            </label>
            <select
              id="product-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to high</option>
              <option value="price-high">Price: High to low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Product count */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Browse products
          </h2>
          <p className="text-sm text-text-muted">
            {filteredProducts.length} products
          </p>
        </div>

        {/* Product grid */}
        {filteredProducts.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-border bg-surface transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={`relative flex h-48 items-center justify-center ${product.color}`}
                >
                  <span
                    aria-hidden="true"
                    className="text-7xl transition-transform duration-300 group-hover:scale-110"
                  >
                    {product.emoji}
                  </span>

                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800">
                    {product.category}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{product.name}</h3>
                    <span className="shrink-0 text-lg font-bold text-primary">
                      ₹{product.price}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-text-muted">
                    per {product.unit}
                  </p>

                  <p className="mt-3 min-h-10 text-sm leading-5 text-text-muted">
                    {product.description}
                  </p>

                  <p className="mt-3 text-xs text-text-muted">
                    {product.stock > 0
                      ? `${product.stock} ${product.unit === "dozen" ? "dozen" : "kg"} available`
                      : "Out of stock"}
                  </p>

                  <div className="mt-4">
                    {cart[product.id] ? (
                      <div className="flex items-center justify-between rounded-xl border border-border p-2">
                        <button
                          type="button"
                          onClick={() => changeQuantity(product.id, -1)}
                          aria-label={`Remove one ${product.name}`}
                          className="h-9 w-9 rounded-lg bg-background font-bold hover:bg-primary/10"
                        >
                          −
                        </button>

                        <span className="text-sm font-semibold">
                          {cart[product.id]} in cart
                        </span>

                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          disabled={cart[product.id] >= product.stock}
                          aria-label={`Add one ${product.name}`}
                          className="h-9 w-9 rounded-lg bg-primary font-bold text-white disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add to cart
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-border bg-surface px-5 py-16 text-center">
            <p className="text-lg font-semibold">No products found</p>
            <p className="mt-2 text-sm text-text-muted">
              Try a different search term or category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Cart summary */}
        {cartCount > 0 && (
          <aside className="mt-10 flex flex-col justify-between gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <p className="font-semibold">Your shopping cart</p>
              <p className="mt-1 text-sm text-text-muted">
                {cartCount} items · ₹{cartTotal.toLocaleString("en-IN")}
              </p>
            </div>

            <Link
              href="/cart"
              className="rounded-xl bg-primary px-6 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
            >
              Proceed to cart
            </Link>
          </aside>
        )}
      </div>
    </main>
  );
}
