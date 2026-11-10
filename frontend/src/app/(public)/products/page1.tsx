
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

  const [cart, setCart] = useState<Cart>({});
  const [cartProducts, setCartProducts] = useState<
    Record<string, Product>
  >({});

  // Mobile filter visibility
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
    setShowMobileFilters(false);
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
    setShowMobileFilters(false);
  }

  
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* 1. COMPACT MARKETPLACE HEADER */}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 py-5 sm:flex-row sm:items-center sm:px-6 lg:px-8">

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Mandipro Marketplace
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Fresh Products
            </h1>

            <p className="mt-1 text-sm text-text-muted">
              Discover quality agricultural products at competitive prices.
            </p>
          </div>

          <Link
            href="/cart"
            className="flex items-center justify-between gap-6 rounded-xl border border-border bg-background px-4 py-3 transition hover:border-primary sm:min-w-52"
          >
            <div>
              <p className="text-xs text-text-muted">Shopping cart</p>
              <p className="mt-1 font-bold">{cartCount} items</p>
            </div>

            <div className="text-right">
              <p className="text-xs text-text-muted">Total</p>
              <p className="mt-1 font-bold text-primary">
                {formatPrice(cartTotal)}
              </p>
            </div>
          </Link>

        </div>
      </header>

      {/* 2. MAIN MARKETPLACE CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

        <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">

          {/* 3. DESKTOP FILTER SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-5 rounded-xl border border-border bg-surface p-4">

              <div className="flex items-center justify-between">
                <h2 className="font-bold">Filters</h2>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Clear all
                </button>
              </div>

              <form onSubmit={applyFilters} className="mt-5 space-y-5">

                {/* Category filter */}
                <div>
                  <label
                    htmlFor="sidebar-category"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Product category
                  </label>

                  <input
                    id="sidebar-category"
                    value={categoryInput}
                    onChange={(event) =>
                      setCategoryInput(event.target.value)
                    }
                    placeholder="e.g. Vegetables"
                    maxLength={100}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Unit filter */}
                <div>
                  <label
                    htmlFor="sidebar-unit"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Selling unit
                  </label>

                  <select
                    id="sidebar-unit"
                    value={unitInput}
                    onChange={(event) =>
                      setUnitInput(event.target.value)
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  >
                    <option value="">All units</option>

                    {PRODUCT_UNITS.map((productUnit) => (
                      <option key={productUnit} value={productUnit}>
                        {formatUnit(productUnit)}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Apply filters
                </button>

              </form>

              <div className="my-5 border-t border-border" />

              {/* Category navigation */}
              <h3 className="mb-3 text-sm font-semibold">
                Browse categories
              </h3>

              <div className="space-y-1">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setActiveCategory(item)}
                    aria-pressed={activeCategory === item}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      activeCategory === item
                        ? "bg-primary text-white"
                        : "text-text-muted hover:bg-surface-muted hover:text-foreground"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

            </div>
          </aside>

          {/* 4. MAIN PRODUCT CONTENT */}
          <div className="min-w-0 space-y-5">

            {/* SEARCH BAR */}
            <section className="rounded-xl border border-border bg-surface p-3 sm:p-4">

              <div className="flex flex-col gap-3 sm:flex-row">

                <div className="relative min-w-0 flex-1">
                  <label
                    htmlFor="product-search"
                    className="sr-only"
                  >
                    Search products
                  </label>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>

                  <input
                    id="product-search"
                    type="search"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search potatoes, onions, vegetables..."
                    className="w-full rounded-lg border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Mobile filter toggle */}
                <button
                  type="button"
                  onClick={() =>
                    setShowMobileFilters((current) => !current)
                  }
                  aria-expanded={showMobileFilters}
                  className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold hover:bg-surface-muted lg:hidden"
                >
                  <span>Filters</span>
                  <span aria-hidden="true">☷</span>
                </button>

              </div>

              {/* MOBILE FILTER PANEL */}
              {showMobileFilters && (
                <div className="mt-4 rounded-lg border border-border bg-background p-4 lg:hidden">

                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">Filter products</h3>

                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs font-semibold text-primary"
                    >
                      Clear all
                    </button>
                  </div>

                  <form
                    onSubmit={applyFilters}
                    className="mt-4 space-y-3"
                  >
                    <div>
                      <label
                        htmlFor="mobile-category"
                        className="mb-1 block text-sm font-medium"
                      >
                        Category
                      </label>

                      <input
                        id="mobile-category"
                        value={categoryInput}
                        onChange={(event) =>
                          setCategoryInput(event.target.value)
                        }
                        placeholder="e.g. Vegetables"
                        maxLength={100}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="mobile-unit"
                        className="mb-1 block text-sm font-medium"
                      >
                        Selling unit
                      </label>

                      <select
                        id="mobile-unit"
                        value={unitInput}
                        onChange={(event) =>
                          setUnitInput(event.target.value)
                        }
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
                      >
                        <option value="">All units</option>

                        {PRODUCT_UNITS.map((productUnit) => (
                          <option key={productUnit} value={productUnit}>
                            {formatUnit(productUnit)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      Apply filters
                    </button>
                  </form>

                </div>
              )}

              {/* CATEGORY CHIPS */}
              <div className="mt-4 border-t border-border pt-3">

                <div className="mb-2 text-xs font-semibold text-text-muted">
                  Popular categories
                </div>

                <div className="flex flex-wrap gap-2">
                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setActiveCategory(item);
                        setPage(1);
                      }}
                      aria-pressed={activeCategory === item}
                      className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                        activeCategory === item
                          ? "bg-primary text-white"
                          : "border border-border bg-background hover:border-primary hover:text-primary"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

              </div>

            </section>

            {/* PRODUCT LIST HEADER CONTINUES IN PART 3 */}

            {/* 5. PRODUCT COUNT AND SORTING */}
            <section className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

              <div>
                <h2 className="text-lg font-bold">
                  Browse Products
                </h2>

                <p className="mt-1 text-xs text-text-muted">
                  Showing {filteredProducts.length} products
                  {pagination ? ` · ${pagination.total} total products` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isFetching && !isLoading && (
                  <span
                    role="status"
                    className="text-xs text-text-muted"
                  >
                    Updating...
                  </span>
                )}

                <label
                  htmlFor="product-sort"
                  className="whitespace-nowrap text-xs font-medium text-text-muted"
                >
                  Sort by:
                </label>

                <select
                  id="product-sort"
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as SortOption)
                  }
                  className="min-w-0 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>

            </section>

            {/* 6. LOADING STATE */}
            {isLoading ? (

              <div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                aria-label="Loading products"
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={index}
                    className="h-72 animate-pulse rounded-xl border border-border bg-surface-muted"
                  />
                ))}
              </div>

            ) : isError ? (

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

              <div className="rounded-xl border border-dashed border-border bg-surface px-5 py-16 text-center">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-2xl">
                  <span aria-hidden="true">🔍</span>
                </div>

                <h3 className="text-lg font-bold">
                  No Products Found
                </h3>

                <p className="mt-2 text-sm text-text-muted">
                  Try a different search term or category, or clear your filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Clear Filters
                </button>

              </div>

            ) : (

              <>
                {/* 9. PRODUCT GRID */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

                  {filteredProducts.map((product) => {
                    const quantity = cart[product.id] ?? 0;
                    const outOfStock = product.stockQuantity <= 0;
                    const reachedStockLimit =
                      quantity >= product.stockQuantity;

                    return (
                      <article
                        key={product.id}
                        className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition duration-200 hover:-translate-y-1 hover:shadow-lg"
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
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />

                          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm">
                            {product.category}
                          </span>

                          {outOfStock && (
                            <span className="absolute right-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                              Out of stock
                            </span>
                          )}

                        </div>

                        {/* PRODUCT DETAILS */}
                        <div className="flex flex-1 flex-col p-4">

                          <div className="flex items-start justify-between gap-2">

                            <h3 className="min-w-0 font-semibold">
                              {product.name}
                            </h3>

                            <span className="shrink-0 text-base font-bold text-primary">
                              {formatPrice(product.price)}
                            </span>

                          </div>

                          <p className="mt-1 text-xs text-text-muted">
                            Per {formatUnit(product.unit)}
                          </p>

                          <p className="mt-3 line-clamp-2 text-sm leading-5 text-text-muted">
                            {product.description ||
                              "Quality supplies for your business."}
                          </p>

                          <p className="mt-3 text-xs text-text-muted">
                            {outOfStock
                              ? "Currently unavailable"
                              : `Available: ${product.stockQuantity} ${formatUnit(product.unit)}`}
                          </p>

                          {/* CART ACTIONS */}
                          <div className="mt-auto pt-4">

                            {quantity > 0 ? (

                              <div className="flex items-center justify-between rounded-lg border border-border p-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    changeQuantity(product, -1)
                                  }
                                  aria-label={`Remove one ${product.name}`}
                                  className="h-9 w-9 rounded-lg bg-background font-bold transition hover:bg-primary/10"
                                >
                                  −
                                </button>

                                <span
                                  className="text-sm font-semibold"
                                  aria-live="polite"
                                >
                                  {quantity} in cart
                                </span>

                                <button
                                  type="button"
                                  onClick={() => addToCart(product)}
                                  disabled={reachedStockLimit}
                                  aria-label={`Add one ${product.name}`}
                                  className="h-9 w-9 rounded-lg bg-primary font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  +
                                </button>

                              </div>

                            ) : (

                              <button
                                type="button"
                                onClick={() => addToCart(product)}
                                disabled={outOfStock}
                                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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

                {/* PAGINATION CONTINUES IN PART 4 */}

                {/* 10. PAGINATION */}
                {pagination && pagination.totalPages > 1 && (

                  <nav
                    aria-label="Product pagination"
                    className="flex flex-wrap items-center justify-center gap-4 border-t border-border pt-5"
                  >

                    <button
                      type="button"
                      disabled={page <= 1 || isFetching}
                      onClick={() =>
                        setPage((current) => current - 1)
                      }
                      className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <span className="text-sm font-medium text-text-muted">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={
                        page >= pagination.totalPages || isFetching
                      }
                      onClick={() =>
                        setPage((current) => current + 1)
                      }
                      className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>

                  </nav>
                )}

              </>
            )}

          </div>
        </div>

        {/* 11. CART SUMMARY */}
        {cartCount > 0 && (

          <aside className="mt-6 flex flex-col justify-between gap-4 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:p-5">

            <div>
              <h2 className="font-bold">
                Your Shopping Cart
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                {cartCount} items · {formatPrice(cartTotal)}
              </p>
            </div>

            <Link
              href="/cart"
              className="rounded-lg bg-primary px-6 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
            >
              Proceed to Cart
            </Link>

          </aside>
        )}

      </div>
    </main>
  );
}
