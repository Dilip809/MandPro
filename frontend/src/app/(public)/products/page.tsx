
"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";

import { useGetProductsQuery } from "@/features/products/productsApi";
import { PRODUCT_UNITS } from "@/features/products/types";
import type { Product, ProductUnit } from "@/features/products/types";

const PAGE_SIZE = 12;

type SortOption = "featured" | "price-low" | "price-high" | "name";
type Cart = Record<string, number>;

const formatPrice = (price: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price);

const formatUnit = (unit: ProductUnit): string => {
  switch (unit) {
    case "KG":
      return "kg";
    case "QUINTAL":
      return "quintal";
    case "BAG":
      return "bag";
    default:
      return unit;
  }
};

export default function ProductsPage() {
  const [categoryInput, setCategoryInput] = useState("");
  const [unitInput, setUnitInput] = useState("");

  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState<ProductUnit | "">("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");
  const [activeCategory, setActiveCategory] = useState("All");

  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [cart, setCart] = useState<Cart>({});
  const [cartProducts, setCartProducts] = useState<Record<string, Product>>({});

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetProductsQuery({
    page,
    limit: PAGE_SIZE,
    ...(category ? { category } : {}),
    ...(unit ? { unit } : {}),
  });

  const apiProducts = useMemo(
    () => data?.data.products ?? [],
    [data?.data.products]
  );

  const pagination = data?.data?.pagination;

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          apiProducts
            .map((product) => product.category)
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    ],
    [apiProducts]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = apiProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.description ?? "").toLowerCase().includes(query);

      const matchesCategory =
        activeCategory === "All" ||
        product.category === activeCategory;

      return matchesSearch && matchesCategory;
    });

    switch (sort) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;

      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;

      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;

      default:
        break;
    }

    return result;
  }, [apiProducts, search, activeCategory, sort]);

  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0
  );

  const cartTotal = Object.entries(cart).reduce(
    (total, [id, quantity]) => {
      return total + (cartProducts[id]?.price ?? 0) * quantity;
    },
    0
  );

  function addToCart(product: Product) {
    if (product.stockQuantity <= 0) return;

    const currentQuantity = cart[product.id] ?? 0;

    if (currentQuantity >= product.stockQuantity) return;

    setCartProducts((current) => ({
      ...current,
      [product.id]: product,
    }));

    setCart((current) => ({
      ...current,
      [product.id]: (current[product.id] ?? 0) + 1,
    }));
  }

  function changeQuantity(product: Product, amount: number) {
    setCartProducts((current) => ({
      ...current,
      [product.id]: product,
    }));

    setCart((current) => {
      const next = { ...current };
      const quantity = (next[product.id] ?? 0) + amount;

      if (quantity <= 0) {
        delete next[product.id];
      } else {
        next[product.id] = Math.min(
          quantity,
          product.stockQuantity
        );
      }

      return next;
    });
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCategory(categoryInput.trim());
    setUnit(unitInput as ProductUnit | "");

    setActiveCategory("All");
    setPage(1);
    setShowFilters(false);
  }

  function clearFilters() {
    setCategoryInput("");
    setUnitInput("");

    setCategory("");
    setUnit("");

    setSearch("");
    setActiveCategory("All");
    setSort("featured");

    setPage(1);
    setShowFilters(false);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* COMPACT PAGE HEADER */}

      <header className="border-b border-border bg-surface">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6">

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Mandipro Marketplace
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Fresh Products
            </h1>

            <p className="mt-1 text-xs text-text-muted sm:text-sm">
              Discover quality vegetables and compare prices.
            </p>
          </div>

          {/* CART QUICK SUMMARY */}

          <Link
            href="/cart"
            className="flex items-center justify-between gap-5 rounded-xl border border-border bg-background px-4 py-2.5 transition hover:border-primary sm:min-w-48"
          >
            <div>
              <p className="text-xs text-text-muted">
                Your Cart
              </p>

              <p className="text-sm font-bold">
                {cartCount} items
              </p>

              <p className="text-xs font-semibold text-primary">
                {formatPrice(cartTotal)}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2h2l2.66 12.42a2 2 0 0 0 2 1.58h9.72a2 2 0 0 0 2-1.58L22 7H5" />
              </svg>
            </div>
          </Link>

        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:px-6">

        {/* SEARCH + SORT + FILTER TOOLBAR */}

        <section className="rounded-xl border border-border bg-surface p-3">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

            {/* SEARCH */}

            <div className="relative min-w-0 flex-1">

              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tomatoes, onions, vegetables..."
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

            </div>

            {/* SORT AND FILTER */}

            <div className="flex flex-wrap gap-2">

              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as SortOption)
                }
                aria-label="Sort products"
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary sm:flex-none"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>

              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                aria-expanded={showFilters}
                className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                  showFilters || category || unit
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background hover:border-primary"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 21v-7" />
                  <path d="M4 10V3" />
                  <path d="M12 21v-9" />
                  <path d="M12 8V3" />
                  <path d="M20 21v-5" />
                  <path d="M20 12V3" />
                  <path d="M2 14h4" />
                  <path d="M10 8h4" />
                  <path d="M18 16h4" />
                </svg>

                Filters

                {(category || unit) && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                    {(category ? 1 : 0) + (unit ? 1 : 0)}
                  </span>
                )}
              </button>

            </div>
          </div>

          {/* COLLAPSIBLE FILTER PANEL */}

          {showFilters && (

            <form
              onSubmit={applyFilters}
              className="mt-3 grid grid-cols-1 gap-3 border-t border-border pt-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]"
            >

              <div>
                <label
                  htmlFor="category"
                  className="mb-1.5 block text-xs font-semibold"
                >
                  Product Category
                </label>

                <input
                  id="category"
                  value={categoryInput}
                  onChange={(event) =>
                    setCategoryInput(event.target.value)
                  }
                  placeholder="e.g. Vegetables"
                  maxLength={100}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="unit"
                  className="mb-1.5 block text-xs font-semibold"
                >
                  Selling Unit
                </label>

                <select
                  id="unit"
                  value={unitInput}
                  onChange={(event) =>
                    setUnitInput(event.target.value)
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                >
                  <option value="">All Units</option>

                  {PRODUCT_UNITS.map((productUnit) => (
                    <option key={productUnit} value={productUnit}>
                      {formatUnit(productUnit)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">

                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Apply
                </button>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-background"
                >
                  Clear
                </button>

              </div>

            </form>

          )}

        </section>

        {/* COMPACT CATEGORY FILTERS */}

        <section className="rounded-xl border border-border bg-surface px-3 py-3">

          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold">
              Categories
            </h2>

            <span className="text-xs text-text-muted">
              {categories.length - 1} categories
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">

            {categories.map((item) => (

              <button
                key={item}
                type="button"
                onClick={() => setActiveCategory(item)}
                aria-pressed={activeCategory === item}
                className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  activeCategory === item
                    ? "bg-primary text-white shadow-sm"
                    : "border border-border bg-background text-text-muted hover:border-primary hover:text-primary"
                }`}
              >
                {item}
              </button>

            ))}

          </div>
        </section>

        {/* PRODUCT HEADING */}

        <section>

          <div className="flex flex-wrap items-center justify-between gap-2">

            <div>
              <h2 className="text-lg font-bold">
                Browse Products
              </h2>

              <p className="text-xs text-text-muted">
                Showing {filteredProducts.length} products on this page
                {pagination ? ` · ${pagination.total} total` : ""}
              </p>
            </div>

            {isFetching && !isLoading && (
              <span
                className="text-xs font-medium text-primary"
                role="status"
              >
                Updating products...
              </span>
            )}

          </div>
        </section>

        {/* LOADING STATE */}

        {isLoading ? (

          <div
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
            aria-label="Loading products"
          >
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-xl border border-border bg-surface-muted"
              />
            ))}
          </div>

        ) : isError ? (

          /* ERROR STATE */

          <div className="rounded-xl border border-border bg-surface p-8 text-center">

            <h3 className="text-lg font-bold">
              Unable to load products
            </h3>

            <p className="mt-2 text-sm text-text-muted">
              Please check your connection and try again.
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white"
            >
              Try Again
            </button>

          </div>

        ) : filteredProducts.length === 0 ? (

          /* EMPTY STATE */

          <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">

            <h3 className="text-lg font-bold">
              No Products Found
            </h3>

            <p className="mt-2 text-sm text-text-muted">
              Try a different search term or category, or clear your filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white"
            >
              Clear Filters
            </button>

          </div>

        ) : (

          <>

            {/* PRODUCT GRID */}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">

              {filteredProducts.map((product) => {

                const quantity = cart[product.id] ?? 0;
                const outOfStock = product.stockQuantity <= 0;

                const reachedStockLimit =
                  quantity >= product.stockQuantity;

                return (

                  <article
                    key={product.id}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface transition hover:shadow-lg sm:rounded-2xl"
                  >

                    {/* PRODUCT IMAGE */}

                    <div className="relative aspect-4/3 overflow-hidden bg-surface-muted">

                      <Image
                        src={
                          product.image ||
                          "/images/products/default-vegetable.jpg"
                        }
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      <span className="absolute left-2 top-2 max-w-[85%] truncate rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-gray-800 sm:text-xs">
                        {product.category}
                      </span>

                    </div>

                    {/* PRODUCT DETAILS */}

                    <div className="flex flex-1 flex-col p-3 sm:p-4">

                      <div className="flex flex-col gap-1">

                        <h3 className="line-clamp-1 text-sm font-semibold sm:text-base">
                          {product.name}
                        </h3>

                        <span className="text-base font-bold text-primary sm:text-lg">
                          {formatPrice(product.price)}
                        </span>

                      </div>

                      <p className="text-xs text-text-muted">
                        per {formatUnit(product.unit)}
                      </p>

                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-text-muted sm:line-clamp-3 sm:text-sm">
                        {product.description ||
                          "Quality supplies for your business."}
                      </p>

                      <p className="mt-2 text-[10px] text-text-muted sm:text-xs">
                        {outOfStock
                          ? "Out of stock"
                          : `Available: ${product.stockQuantity} ${formatUnit(product.unit)}`}
                      </p>

                      {/* ADD TO CART */}

                      <div className="mt-auto pt-3">

                        {quantity > 0 ? (

                          <div className="flex items-center justify-between gap-1 rounded-lg border border-border p-1">

                            <button
                              type="button"
                              onClick={() => changeQuantity(product, -1)}
                              aria-label={`Remove one ${product.name}`}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-background text-lg font-bold transition hover:bg-primary/10"
                            >
                              −
                            </button>

                            <span
                              className="text-xs font-semibold sm:text-sm"
                              aria-live="polite"
                            >
                              {quantity} in cart
                            </span>

                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              disabled={reachedStockLimit}
                              aria-label={`Add one ${product.name}`}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              +
                            </button>

                          </div>

                        ) : (

                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            disabled={outOfStock}
                            className="w-full rounded-lg bg-primary px-2 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                          >
                            {outOfStock ? "Out of Stock" : "Add to Cart"}
                          </button>

                        )}

                      </div>

                    </div>

                  </article>

                );

              })}

            </div>

            {/* PAGINATION */}

            {pagination && pagination.totalPages > 1 && (

              <nav
                aria-label="Product pagination"
                className="flex flex-wrap items-center justify-center gap-3 py-3"
              >

                <button
                  type="button"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-xs font-medium text-text-muted sm:text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    page >= pagination.totalPages || isFetching
                  }
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>

              </nav>

            )}

          </>

        )}

        {/* CART SUMMARY */}

        {cartCount > 0 && (

          <aside className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center">

            <div>

              <h2 className="text-sm font-bold">
                Your Shopping Cart
              </h2>

              <p className="mt-1 text-xs text-text-muted sm:text-sm">
                {cartCount} items · {formatPrice(cartTotal)}
              </p>
              
            </div>
            <Link
              href="/cart"
              className="rounded-lg bg-primary px-6 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
            >
              Proceed to Cart
            </Link>
          </aside>
        )}
      </div>
    </main>
  );
}
