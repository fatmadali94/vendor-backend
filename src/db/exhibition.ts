import mongoose from "mongoose";
const ExhibitionSchema = new mongoose.Schema(
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
    title: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

export const ExhibitionModel = mongoose.model("Exhibition", ExhibitionSchema);
export const getExhibitions = () => ExhibitionModel.find();

export const getExhibitionById = (id: string) => ExhibitionModel.findById(id);
export const deleteExhibitionById = (id: string) =>
  ExhibitionModel.findOneAndDelete({ _id: id });
export const updateExhibitionById = (id: string, values: Record<string, any>) =>
  ExhibitionModel.findByIdAndUpdate(id, values);
