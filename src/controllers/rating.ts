import { companies } from "../utils/constants";
import User from "../db/users";
import Rating from "../db/rating";
import Provider from "../db/providers";
import { MaterialProviderModel } from "../db/materials/materialProviders";
import { PartProviderModel } from "../db/parts/partProviders";

export const leaveRating = async (req: any, res: any) => {
  try {
    const { providerId, userId, rating } = req.body;

    // Find the user and provider
    const user = await User.findById(userId);
    if (!user || !user.isVerified) {
      return res
        .status(400)
        .json({ message: "User not found or not verified" });
    }

    // const regularProvider = await Provider.findById(providerId);
    // const materialProvider = await MaterialProviderModel.findById(providerId)
    //   const partProvider = await PartProviderModel.findById(providerId)
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

    // Verify the user's company and position
    const company = companies.find((c: any) => c.id === user.companyId);
    if (!company || !company.positions.includes(user.occupation)) {
      return res
        .status(400)
        .json({ message: "Invalid company or position for this rating" });
    }

    // Check for an existing rating
    let existingRating = await Rating.findOne({
      provider: providerId,
      companyId: user.companyId,
      position: user.occupation,
    });

    if (existingRating) {
      // Archive the current rating and update with a new rating
      existingRating.previousRatings.push({
        rating: existingRating.rating,
        timestamp: existingRating.timestamp,
      });
      existingRating.rating = rating;
      existingRating.timestamp = new Date();
      await existingRating.save();
    } else {
      // Create a new rating entry
      const newRating = new Rating({
        provider: providerId,
        companyId: user.companyId,
        position: user.occupation,
        user: userId,
        rating: rating,
        timestamp: new Date(),
      });
      const savedRating = await newRating.save();
      provider.ratings.push(savedRating._id);
      await provider.save();
    }
    const updatedRatings = await Rating.find({ provider: providerId });
    return res.status(200).json({ ratings: updatedRatings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
