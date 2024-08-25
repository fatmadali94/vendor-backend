import mongoose from "mongoose";
const ProductSchema = new mongoose.Schema(
  {
    image: {
      public_id: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
    },
    slug: { type: String, required: false },
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const productModel = mongoose.model("Products", ProductSchema);
export const getProducts = () => productModel.find();
export const getProductById = (id: string) => productModel.findById(id);
export const deleteProductById = (id: string) =>
  productModel.findOneAndDelete({ _id: id });
//
