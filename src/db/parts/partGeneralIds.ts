import mongoose from "mongoose";
const PartGeneralIdSchema = new mongoose.Schema(
  {
    image: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    slug: { type: String, required: false },
    title: { type: String, required: true },
    description: { type: String, required: true },
    partnames: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PartNames",
        required: true,
      },
    ],

    partproviders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PartProviders",
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const partGeneralIdModel = mongoose.model(
  "PartGeneralIds",
  PartGeneralIdSchema
);
export const getPartGeneralIds = () =>
  partGeneralIdModel.find().populate("partnames");

export const getPartGeneralIdById = (id: string) =>
  partGeneralIdModel.findById(id);
// export const createPartGeneralId = (values: any) =>
//   new partGeneralIdModel(values).save().then((sub) => sub.toObject());
export const deletePartGeneralIdById = (id: string) =>
  partGeneralIdModel.findOneAndDelete({ _id: id });
export const updatePartGeneralIdById = (
  id: string,
  values: Record<string, any>
) => partGeneralIdModel.findByIdAndUpdate(id, values);
