import User from "../db/users";
import { Ticket } from "../db/tickets";
import express from "express";
import cloudinary from "../utils/cloudinary";

export const getAllTickets = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId, subject, description } = req.body;
    const newTicket = new Ticket({ user: userId, subject, description });
    const savedTicket = await newTicket.save();

    // Add the ticket reference to the user
    await User.findByIdAndUpdate(userId, {
      $push: { tickets: savedTicket._id },
    });

    res.status(201).json(savedTicket);
  } catch (error) {
    res.status(500).json({ message: "Error creating ticket", error });
  }
};

// Get Tickets for a User
export const getTicket = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId } = req.params;
    const tickets = await Ticket.find({ user: userId });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tickets", error });
  }
};

// Admin Response to Ticket (Update)
export const updateTicket = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { adminResponse, status } = req.body;
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.ticketId,
      { adminResponse, status },
      { new: true }
    );
    res.status(200).json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: "Error updating ticket", error });
  }
};

export const createTicket = async (
  req: express.Request<{ file: any }>,
  res: express.Response
) => {
  try {
    let newTicket = null;
    if (req.body.image) {
      const result = await cloudinary.uploader.upload(req.body.image, {
        folder: "tickets",
      });
      newTicket = new Ticket({
        ...req.body,
        image: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      });
    } else {
      newTicket = new Ticket({
        ...req.body,
      });
    }

    await newTicket.save();
    return res.status(200).json(newTicket!).end();
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
};
