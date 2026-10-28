
"use client";

import { useState, type FormEvent } from "react";

import {
  useCreateProductMutation,
  useGetMyProductsQuery,
  useRestoreProductMutation,
  useUpdateProductMutation,
  useUpdateProductStatusMutation,
} from "@/features/products/productsApi";

import {
  PRODUCT_UNITS,
  type Product,
  type ProductInput,
  type ProductStatus,
  type ProductUnit,
} from "@/features/products/types";

const emptyForm: ProductInput = {
  name: "",
  description: "",
  category: "",
  unit: "KG",
  price: 0,
  stockQuantity: 0,
};

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = error.data;

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }
  }

  return "Something went wrong. Please try again.";
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price);
}

function statusClasses(status: ProductStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    case "INACTIVE":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
    case "ARCHIVED":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
}

export default function SellerProductsPage() {
  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetMyProductsQuery({ page: 1, limit: 50 });

  const [createProduct, { isLoading: isCreating }] =
    useCreateProductMutation();

  const [updateProduct, { isLoading: isUpdating }] =
    useUpdateProductMutation();

  const [updateProductStatus, { isLoading: isUpdatingStatus }] =
    useUpdateProductStatusMutation();

  const [restoreProduct, { isLoading: isRestoring }] =
    useRestoreProductMutation();

  const products = data?.data.products ?? [];
  const isSaving = isCreating || isUpdating;

  function startEditing(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description ?? "",
      category: product.category,
      unit: product.unit,
      price: product.price,
      stockQuantity: product.stockQuantity,
    });
    setFormError("");
    setNotice("");
  }

  function resetForm() {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setNotice("");

    const input: ProductInput = {
      name: form.name.trim(),
      category: form.category.trim(),
      unit: form.unit,
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity),
      ...(form.description?.trim()
        ? { description: form.description.trim() }
        : {}),
    };

    if (!input.name || !input.category) {
      setFormError("Product name and category are required.");
      return;
    }

    if (!Number.isFinite(input.price) || input.price <= 0) {
      setFormError("Price must be greater than zero.");
      return;
    }

    if (
      !Number.isFinite(input.stockQuantity) ||
      input.stockQuantity < 0
    ) {
      setFormError("Stock quantity cannot be negative.");
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct({
          id: editingProduct.id,
          data: input,
        }).unwrap();

        setNotice("Product updated successfully.");
      } else {
        await createProduct(input).unwrap();
        setNotice("Product created as a draft.");
      }

      resetForm();
    } catch (error: unknown) {
      setFormError(getErrorMessage(error));
    }
  }

  async function handleStatusChange(
    product: Product,
    status: "ACTIVE" | "INACTIVE" | "ARCHIVED",
  ) {
    setFormError("");
    setNotice("");

    try {
      await updateProductStatus({
        id: product.id,
        status,
      }).unwrap();

      setNotice(
        status === "ARCHIVED"
          ? "Product archived."
          : `Product status changed to ${status}.`,
      );
    } catch (error: unknown) {
      setFormError(getErrorMessage(error));
    }
  }

  async function handleRestore(product: Product) {
    setFormError("");
    setNotice("");

    try {
      await restoreProduct(product.id).unwrap();
      setNotice("Product restored as a draft.");
    } catch (error: unknown) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-5 py-8 sm:px-8">
      <header>
        <h1 className="text-2xl font-bold">Product Management</h1>
        <p className="mt-2 text-text-muted">
          Create products, manage prices and stock, and control which
          products buyers can see.
        </p>
      </header>

      {formError && (
        <div
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
        >
          {formError}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300"
        >
          {notice}
        </div>
      )}

      <section className="rounded-xl border border-border p-5 sm:p-6">
        <h2 className="text-lg font-semibold">
          {editingProduct ? "Edit product" : "Add a new product"}
        </h2>

        <p className="mt-1 text-sm text-text-muted">
          New products start as drafts and are not visible in the public
          marketplace until activated.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Product name
              <input
                required
                minLength={2}
                maxLength={150}
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="e.g. Potato"
                className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2"
              />
            </label>

            <label className="block text-sm font-medium">
              Category
              <input
                required
                minLength={2}
                maxLength={100}
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
                placeholder="e.g. Vegetables"
                className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2"
              />
            </label>

            <label className="block text-sm font-medium">
              Price (₹ per selected unit)
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.price || ""}
                onChange={(event) =>
                  setForm({
                    ...form,
                    price:
                      event.target.value === ""
                        ? 0
                        : Number(event.target.value),
                  })
                }
                placeholder="e.g. 2500"
                className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2"
              />
            </label>

            <label className="block text-sm font-medium">
              Unit
              <select
                value={form.unit}
                onChange={(event) =>
                  setForm({
                    ...form,
                    unit: event.target.value as ProductUnit,
                  })
                }
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
              >
                {PRODUCT_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium sm:col-span-2">
              Stock quantity ({form.unit})
              <input
                required
                type="number"
                min="0"
                step="any"
                value={form.stockQuantity}
                onChange={(event) =>
                  setForm({
                    ...form,
                    stockQuantity:
                      event.target.value === ""
                        ? 0
                        : Number(event.target.value),
                  })
                }
                className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2"
              />
            </label>

            <label className="block text-sm font-medium sm:col-span-2">
              Description (optional)
              <textarea
                maxLength={2000}
                rows={3}
                value={form.description ?? ""}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                placeholder="Product quality, variety, packaging, and other details"
                className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-primary px-5 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? "Saving..."
                : editingProduct
                  ? "Save changes"
                  : "Create draft"}
            </button>

            {editingProduct && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-border px-5 py-2.5 font-medium"
              >
                Cancel editing
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Your products</h2>
            <p className="text-sm text-text-muted">
              {data
                ? `${data.data.pagination.total} product(s) found`
                : "Manage your current inventory"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
          >
            Refresh
          </button>
        </div>

        {isLoading && (
          <p role="status" className="py-8 text-text-muted">
            Loading your products...
          </p>
        )}

        {isError && !isLoading && (
          <div className="rounded-lg border border-border p-5">
            <p role="alert">Could not load your products.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 rounded-lg border border-border px-4 py-2 text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <h3 className="font-semibold">No products yet</h3>
            <p className="mt-2 text-sm text-text-muted">
              Create your first product using the form above.
            </p>
          </div>
        )}

        {products.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-surface-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {products.map((product) => {
                  const status = product.status ?? "DRAFT";

                  return (
                    <tr key={product.id}>
                      <td className="px-4 py-4">
                        <p className="font-medium">{product.name}</p>
                        <p className="mt-1 text-xs text-text-muted">
                          {product.category} · {product.unit}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        {formatPrice(product.price)}
                        <span className="text-text-muted">
                          {" "}/ {product.unit}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {product.stockQuantity} {product.unit}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(status)}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {status !== "ARCHIVED" && (
                            <button
                              type="button"
                              onClick={() => startEditing(product)}
                              className="rounded-md border border-border px-3 py-1.5"
                            >
                              Edit
                            </button>
                          )}

                          {status === "DRAFT" && (
                            <button
                              type="button"
                              disabled={isUpdatingStatus}
                              onClick={() =>
                                void handleStatusChange(product, "ACTIVE")
                              }
                              className="rounded-md border border-border px-3 py-1.5 disabled:opacity-50"
                            >
                              Activate
                            </button>
                          )}

                          {status === "ACTIVE" && (
                            <button
                              type="button"
                              disabled={isUpdatingStatus}
                              onClick={() =>
                                void handleStatusChange(product, "INACTIVE")
                              }
                              className="rounded-md border border-border px-3 py-1.5 disabled:opacity-50"
                            >
                              Deactivate
                            </button>
                          )}

                          {status === "INACTIVE" && (
                            <button
                              type="button"
                              disabled={isUpdatingStatus}
                              onClick={() =>
                                void handleStatusChange(product, "ACTIVE")
                              }
                              className="rounded-md border border-border px-3 py-1.5 disabled:opacity-50"
                            >
                              Activate
                            </button>
                          )}

                          {status !== "ARCHIVED" && (
                            <button
                              type="button"
                              disabled={isUpdatingStatus}
                              onClick={() =>
                                void handleStatusChange(product, "ARCHIVED")
                              }
                              className="rounded-md border border-red-300 px-3 py-1.5 text-red-700 disabled:opacity-50 dark:text-red-300"
                            >
                              Archive
                            </button>
                          )}

                          {status === "ARCHIVED" && (
                            <button
                              type="button"
                              disabled={isRestoring}
                              onClick={() => void handleRestore(product)}
                              className="rounded-md border border-border px-3 py-1.5 disabled:opacity-50"
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
