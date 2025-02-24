import mongoose from "mongoose";

const userTicketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["pending", "closed"], default: "pending" },
    adminResponse: { type: String, default: "" },

    image: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
      originalFileName: { type: String, default: null }, 
    },
  },
  { timestamps: true }
);

export const UserTicket = mongoose.model("UserTicket", userTicketSchema);
