// controllers/commentController.js
import Comment from "../db/comments";
import Provider from "../db/providers";
import User from "../db/users";
import { MaterialProviderModel } from "../db/materials/materialProviders";
import { PartProviderModel } from "../db/parts/partProviders";

export const leaveComment = async (req: any, res: any) => {
  try {
    const { providerId, userId, content } = req.body;

    // Find the user and verify
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Find the provider
    const [regularProvider, materialProvider, partProvider] = await Promise.all(
      [
        Provider.findById(providerId),
        MaterialProviderModel.findById(providerId),
        PartProviderModel.findById(providerId),
      ]
    );
    const provider = regularProvider || materialProvider || partProvider;

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Create the new comment
    const newComment = new Comment({
      user: userId,
      companyId: user.companyId,
      position: user.occupation,
      provider: providerId,
      content,
      timestamp: new Date(),
    });

    const savedComment = await newComment.save();

    // Add the comment ID to the provider's comments array
    provider.comments.push(savedComment._id);
    await provider.save();

    return res.status(200).json(savedComment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
