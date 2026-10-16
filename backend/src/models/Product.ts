import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

export const PRODUCT_UNITS = [
  "KG",
  "QUINTAL",
  "BAG",
] as const;

export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export const PRODUCT_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface IProduct {
  sellerId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  category: string;
  unit: ProductUnit;
  price: number;
  stockQuantity: number;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
      maxlength: 100,
    },

    unit: {
      type: String,
      enum: PRODUCT_UNITS,
      required: true,
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0.01, "Price must be greater than zero"],
    },

    stockQuantity: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    status: {
      type: String,
      enum: PRODUCT_STATUSES,
      default: "DRAFT",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productSchema.index({ sellerId: 1, name: 1 });

const Product: Model<IProduct> =
  (models.Product as Model<IProduct>) ||
  model<IProduct>("Product", productSchema);

export default Product;