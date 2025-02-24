import Provider from "../db/providers";
import { ProviderTicket } from "../db/providerTickets";
import express from "express";
import cloudinary from "../utils/cloudinary";
import providerTickets from "router/providerTickets";

export const getAllProviderTickets = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const allTickets = await ProviderTicket.find().populate("provider", "form_filler_name providerId");
    res.status(200).json(allTickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tickets", error });
  }
};


// Get ProviderTickets for a Provider
export const getProviderTicket = async (
req: express.Request,
res: express.Response
) => {
    try {
      const { providerId } = req.params;
  
 
      const providerTickets = await ProviderTicket.find({ provider: providerId }).populate("provider", "form_filler_name providerId company_name");
  
  
      if (!providerTickets || providerTickets.length === 0) {
        return res.status(200).json([]); // ✅ Return empty array instead of an error
      }
  
      res.status(200).json(providerTickets);
    } catch (error) {
      console.error("❌ Error fetching provider tickets:", error);
      res.status(500).json({ message: "Error fetching tickets", error });
    }
  };
  

// Admin Response to Ticket (Update)
export const updateProviderTicket = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { adminResponse, status } = req.body;
    const updatedProviderTicket = await ProviderTicket.findByIdAndUpdate(
      req.params.providerTicketId,
      { adminResponse, status },
      { new: true }
    );
    res.status(200).json(updatedProviderTicket);
  } catch (error) {
    res.status(500).json({ message: "Error updating ticket", error });
  }
};

export const createProviderTicket = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { providerId, subject, description, image, originalFileName } = req.body;

    let uploadedImage = null;

    if (image) {
      const result = await cloudinary.uploader.upload(image, {
        folder: "providerTickets",
        resource_type: "auto",
      });

      uploadedImage = {
        public_id: result.public_id,
        url: result.secure_url,
        originalFileName: originalFileName || "Unknown File", // ✅ Ensure file name is saved
      };
    }

    const newProviderTicket = new ProviderTicket({
      provider: providerId,
      subject,
      description,
      image: uploadedImage, // ✅ Store the full image object, including originalFileName
    });

    await newProviderTicket.save();


    return res.status(201).json(newProviderTicket); // ✅ Ensure full ticket object is sent back
  } catch (error) {
    console.error("❌ Error creating ticket:", error);
    res.status(500).json({ message: "Error creating ticket", error });
  }
};
