import mongoose from "mongoose";

const podcastSchema = new mongoose.Schema ({
    audioFile: {
        public_id: { type: String }, url: { type: String } 
      },
    image: { public_id: { type: String }, url: { type: String } },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    year: { type: Number },
    month: { type: String },
    number: { type: Number },
    duration: {type: String},
    topics: [
      {
        topic: { type: String, required: true }, // ✅ Topic name
      }
    ],  
    sponsors: [{
        name: { type: String },
        images: [{ public_id: { type: String }, url: { type: String } }],
      },
    ],    
    narrator: [
      {
        name: { type: String },
        images: [{ public_id: { type: String }, url: { type: String } }],
      },
    ],
  }, { timestamps: true });

  export const podcastModel = mongoose.model("Podcast", podcastSchema);

  export const getPodcast = () => podcastModel.find();
  export const getPodcastById = (id: string) => podcastModel.findById(id);
  export const deletePodcastById = (id: string) => podcastModel.findOneAndDelete({ _id: id });
  export const createNewPodcast = (data: any) => new podcastModel(data).save(); // ⬅ Renamed to `createNewMagazine`
  export const updatePodcastById = (id: string, data: any) => podcastModel.findByIdAndUpdate(id, data, { new: true });