import User from "../db/users";
import { UserTicket } from "../db/userTickets";
import express from "express";
import cloudinary from "../utils/cloudinary";

export const getAllUserTickets = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const allTickets = await UserTicket.find().populate("user", "name userId");
    res.status(200).json(allTickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tickets", error });
  }
};


// Get UserTickets for a User
export const getUserTicket = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId } = req.params;
    
    const userTickets = await UserTicket.find({ user: userId }).populate("user", "name family_name email");

    if (!userTickets || userTickets.length === 0) {
      return res.status(200).json([]); // ✅ Return empty array instead of 404
    }

    res.status(200).json(userTickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tickets", error });
  }
};





// Admin Response to Ticket (Update)
export const updateUserTicket = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { adminResponse, status } = req.body;
    const updatedUserTicket = await UserTicket.findByIdAndUpdate(
      req.params.userTicketId,
      { adminResponse, status },
      { new: true }
    );
    res.status(200).json(updatedUserTicket);
  } catch (error) {
    res.status(500).json({ message: "Error updating ticket", error });
  }
};

export const createUserTicket = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId, subject, description, image, originalFileName } = req.body;

    let uploadedImage = null;

    if (image) {
      const result = await cloudinary.uploader.upload(image, {
        folder: "userTickets",
        resource_type: "auto",
      });

      uploadedImage = {
        public_id: result.public_id,
        url: result.secure_url,
        originalFileName: originalFileName || "Unknown File", // ✅ Ensure file name is saved
      };
    }

    const newUserTicket = new UserTicket({
      user: userId,
      subject,
      description,
      image: uploadedImage, // ✅ Store the full image object, including originalFileName
    });

    await newUserTicket.save();


    return res.status(201).json(newUserTicket); // ✅ Ensure full ticket object is sent back
  } catch (error) {
    console.error("❌ Error creating ticket:", error);
    res.status(500).json({ message: "Error creating ticket", error });
  }
};
