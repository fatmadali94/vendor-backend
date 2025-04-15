import mongoose from "mongoose";

const MagazineSchema = new mongoose.Schema({
  image: { public_id: { type: String }, url: { type: String } },
  pdf: { public_id: { type: String }, url: { type: String } },
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  year: { type: Number },
  month: { type: String },
  number: { type: Number },
  
  topics: [
    {
      topic: { type: String, required: true }, // ✅ Topic name
      page: { type: Number, required: true }, // ✅ Related page number
    }
  ],

  pages: [{ type: Number }], // ✅ Store page numbers as an array
  advertisements: [{ public_id: { type: String }, url: { type: String } }],
  editorial: {
    name: { type: String },
    text: { type: String },
    image: { public_id: { type: String }, url: { type: String } },
  },
  
  collectors: [
    {
      name: { type: String },
      images: [{ public_id: { type: String }, url: { type: String } }],
    },
  ],
}, { timestamps: true });

export const magazineModel = mongoose.model("DigitalMagazine", MagazineSchema);

// ✅ Export CRUD functions properly
export const getDigitalMagazine = () => magazineModel.find();
export const getMagazineById = (id: string) => magazineModel.findById(id);
export const deleteMagazineById = (id: string) => magazineModel.findOneAndDelete({ _id: id });
export const createNewMagazine = (data: any) => new magazineModel(data).save(); // ⬅ Renamed to `createNewMagazine`
export const updateMagazineById = (id: string, data: any) => magazineModel.findByIdAndUpdate(id, data, { new: true });
