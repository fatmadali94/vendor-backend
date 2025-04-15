import express from "express";
import { getPodcast,
    getPodcastById,
    updatePodcastById,
    deletePodcastById,
    createNewPodcast
 } from "../db/podcast";
import cloudinary from "../utils/cloudinary";
 import slugify from "slugify";
import { uploadAudioToDrive } from "../utils/googleDrive";



export const createPodcast = async (req: express.Request, res: express.Response) => {
    try {
  
      // Upload cover image
      const imageResult = await cloudinary.uploader.upload(req.body.image, {
        folder: "podcasts/covers",
        timeout: 60000,
      });
  
      const audioDriveResult = await uploadAudioToDrive(
        req.body.audio,  // base64 string
        `${slugify(req.body.title)}.mp3`
      );
      
      const audioFile = {
        public_id: audioDriveResult.id,
        url: `https://drive.google.com/uc?export=download&id=${audioDriveResult.id}`,
      };
      
  
      // Parse JSON inputs
      const topics = Array.isArray(req.body.topics) ? req.body.topics : [];
      const sponsorsInput = Array.isArray(req.body.sponsors) ? req.body.sponsors : [];
      const narratorInput = Array.isArray(req.body.narrator) ? req.body.narrator : [];
        
      const sponsors = await Promise.all(
        sponsorsInput.map(async (sponsor: { name: string; images: string[] }) => ({
          name: sponsor.name,
          images: await Promise.all(
            sponsor.images.map(async (img: string) => {
              const uploaded = await cloudinary.uploader.upload(img, {
                folder: "podcasts/sponsors",
                timeout: 60000,
              });
              return { public_id: uploaded.public_id, url: uploaded.secure_url };
            })
          ),
        }))
      );
  
      const narrator = await Promise.all(
        narratorInput.map(async (narr: { name: string; images: string[] }) => ({
          name: narr.name,
          images: await Promise.all(
            narr.images.map(async (img: string) => {
              const uploaded = await cloudinary.uploader.upload(img, {
                folder: "podcasts/narrators",
                timeout: 60000,
              });
              return { public_id: uploaded.public_id, url: uploaded.secure_url };
            })
          ),
        }))
      );
  
      const podcast = await createNewPodcast({
        title: req.body.title,
        description: req.body.description,
        year: req.body.year,
        month: req.body.month,
        number: req.body.number,
        slug: req.body.slug || slugify(req.body.title, { lower: true, strict: true }),
        duration: req.body.duration,
        topics,
        sponsors,
        narrator,
        image: {
          public_id: imageResult.public_id,
          url: imageResult.secure_url,
        },
        audioFile,
      });
  
      res.status(201).json(podcast);
    } catch (error) {
      console.error("🚨 Podcast creation error:", error);
      res.status(500).json({ message: "Failed to create podcast", error });
    }
  };
  


  export const getAllPodcast = async (req: express.Request, res: express.Response) => {
    try {
      const podcasts = await getPodcast();
      return res.status(200).json(podcasts);
    } catch (error) {
      console.error(error);
      return res.sendStatus(400);
    }
  };

  export const getSinglePodcast = async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const podcast = await getPodcastById(id);
      if (!podcast) {
        return res.status(404).json({ error: "Podcast not found" });
      }
      return res.status(200).json(podcast);
    } catch (error) {
      console.error(error);
      return res.sendStatus(400);
    }
  };

  export const deletePodcast = async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const deletedPodcast: any = await deletePodcastById(id);
  
      if (!deletedPodcast) {
        return res.status(404).json({ message: "Podcast not found" });
      }
  
      // Delete images from Cloudinary
      if (deletedPodcast.image?.public_id) await cloudinary.uploader.destroy(deletedPodcast.image.public_id);
      if (deletedPodcast.pdf?.public_id) await cloudinary.uploader.destroy(deletedPodcast.pdf.public_id, { resource_type: "raw" });
  
      if (deletedPodcast.advertisements) {
        await Promise.all(deletedPodcast.advertisements.map(async (ad: { public_id: string }) => {
          if (ad.public_id) await cloudinary.uploader.destroy(ad.public_id);
        }));
      }
  
      if (deletedPodcast.editorial?.public_id) {
        await cloudinary.uploader.destroy(deletedPodcast.editorial.public_id);
      }
  
      if (deletedPodcast.collectors) {
        await Promise.all(
          deletedPodcast.collectors.map(async (collector: { images: { public_id: string }[] }) => {
            await Promise.all(
              collector.images.map(async (img: { public_id: string }) => {
                if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
              })
            );
          })
        );
      }
  
      return res.status(200).json({ message: "Podcast deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Failed to delete Podcast" });
    }
  };
  

  export const updatePodcast = async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;
  
      if (updatedData.image) {
        const imageResult = await cloudinary.uploader.upload(updatedData.image, { folder: "podcast" });
        updatedData.image = { public_id: imageResult.public_id, url: imageResult.secure_url };
      }
  
      if (updatedData.pdf) {
        const pdfResult = await cloudinary.uploader.upload(updatedData.pdf, { folder: "podcast", resource_type: "raw" });
        updatedData.pdf = { public_id: pdfResult.public_id, url: pdfResult.secure_url };
      }
  
      const updatedPodcast = await updatePodcastById(id, updatedData);
      if (!updatedPodcast) {
        return res.status(404).json({ message: "Podcast not found" });
      }
  
      return res.status(200).json(updatedPodcast);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Failed to update Podcast" });
    }
  };