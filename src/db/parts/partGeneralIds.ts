import mongoose from "mongoose";
const PartGeneralIdSchema = new mongoose.Schema(
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

export const partGeneralIdModel = mongoose.model(
  "PartGeneralIds",
  PartGeneralIdSchema
);
export const getPartGeneralIds = () => partGeneralIdModel.find();

export const deletePartGeneralIdById = (id: string) =>
  partGeneralIdModel.findOneAndDelete({ _id: id });
