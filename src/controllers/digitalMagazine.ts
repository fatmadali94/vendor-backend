import express from "express";
import { 
  getMagazineById, 
  getDigitalMagazine, 
  deleteMagazineById, 
  createNewMagazine,
  updateMagazineById 
} from "../db/digitalMagazine";
import { uploadPDFtoDrive } from "../utils/googleDrive";
import cloudinary from "../utils/cloudinary";
import slugify from "slugify";


/**
 * @desc Create a new Digital Magazine
 * @route POST /api/digitalMagazine
 */
export const createMagazine = async (req: express.Request, res: express.Response) => {
  try {
    // ✅ Upload Cover Image
    const imageResult = await cloudinary.uploader.upload(req.body.image, { 
      folder: "digitalMagazine",
      timeout: 60000 
    });

    const pdfDriveResult = await uploadPDFtoDrive(
      req.body.pdf,  // base64 string
      `${slugify(req.body.title)}.pdf`
    );
    
    const pdf = {
      public_id: pdfDriveResult.id,
      url: `https://drive.google.com/uc?export=download&id=${pdfDriveResult.id}`
        };


    // ✅ Parse and Save Only Manually Entered Pages
    const pagesArray = Array.isArray(req.body.pages)
    ? req.body.pages.map((page: any) => Number(page)) // Convert each item to a number
    : [];
   // If no pages provided, store an empty array

    // ✅ Upload Editorial Image
    let editorialImageResult = null;
    if (req.body.editorial?.image) {
      editorialImageResult = await cloudinary.uploader.upload(req.body.editorial.image, { 
        folder: "digitalMagazine/editorial",
        timeout: 60000 
      });
    }

    // ✅ Upload Advertisements
    const advertisementUrls = req.body.advertisements && Array.isArray(req.body.advertisements)
      ? await Promise.all(
          req.body.advertisements.map(async (ad: string) => {
            const adUpload = await cloudinary.uploader.upload(ad, { 
              folder: "digitalMagazine/advertisements",
              timeout: 60000 
            });
            return { public_id: adUpload.public_id, url: adUpload.secure_url };
          })
        )
      : [];

    // ✅ Upload Collectors' Images
    const uploadedCollectors = req.body.collectors && Array.isArray(req.body.collectors)
      ? await Promise.all(
          req.body.collectors.map(async (collector: { name: string; images: string[] }) => ({
            name: collector.name,
            images: await Promise.all(
              collector.images.map(async (img: string) => {
                const imgUpload = await cloudinary.uploader.upload(img, { 
                  folder: "digitalMagazine/collectors",
                  timeout: 60000 
                });
                return { public_id: imgUpload.public_id, url: imgUpload.secure_url };
              })
            ),
          }))
        )
      : [];

    // ✅ Process Topics
    const topics = req.body.topics && Array.isArray(req.body.topics)
      ? req.body.topics.map((t: { topic: string; page: number }) => ({
          topic: t.topic,
          page: t.page,
        }))
      : [];

      

    // ✅ Create and Save Magazine in Database
    const newMagazine = await createNewMagazine({
      title: req.body.title,
      description: req.body.description,
      year: req.body.year,
      month: req.body.month,
      number: req.body.number,
      slug: req.body.slug 
        ? slugify(req.body.slug, { lower: true, strict: true }) 
        : slugify(req.body.title, { lower: true, strict: true }),
      topics,  // ✅ Save Topics Correctly
      pages: pagesArray, // ✅ Save Only Manually Selected Pages
      image: { public_id: imageResult.public_id, url: imageResult.secure_url },
      pdf,
      advertisements: advertisementUrls,
      editorial: {
        name: req.body.editorial?.name || "",
        text: req.body.editorial?.text || "", 
        image: editorialImageResult 
          ? { public_id: editorialImageResult.public_id, url: editorialImageResult.secure_url } 
          : null, 
      },
      collectors: uploadedCollectors,
    });

    return res.status(201).json(newMagazine);
  } catch (error) {
    console.error("🚨 Error creating magazine:", error);
    return res.status(400).json({ message: "Failed to create magazine" });
  }
};



/**
 * @desc Get all Digital Magazines
 * @route GET /api/digitalMagazine
 */
export const getAllDigitalMagazine = async (req: express.Request, res: express.Response) => {
  try {
    const digitalMagazines = await getDigitalMagazine();
    return res.status(200).json(digitalMagazines);
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};

/**
 * @desc Get a single Digital Magazine by ID
 * @route GET /api/digitalMagazine/:id
 */
export const getSingleMagazine = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const magazine = await getMagazineById(id);
    if (!magazine) {
      return res.status(404).json({ error: "Magazine not found" });
    }
    return res.status(200).json(magazine);
  } catch (error) {
    console.error(error);
    return res.sendStatus(400);
  }
};


/**
 * @desc Delete a Digital Magazine
 * @route DELETE /api/digitalMagazine/:id
 */
export const deleteMagazine = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const deletedMagazine: any = await deleteMagazineById(id);

    if (!deletedMagazine) {
      return res.status(404).json({ message: "Magazine not found" });
    }

    // Delete images from Cloudinary
    if (deletedMagazine.image?.public_id) await cloudinary.uploader.destroy(deletedMagazine.image.public_id);
    if (deletedMagazine.pdf?.public_id) await cloudinary.uploader.destroy(deletedMagazine.pdf.public_id, { resource_type: "raw" });

    if (deletedMagazine.advertisements) {
      await Promise.all(deletedMagazine.advertisements.map(async (ad: { public_id: string }) => {
        if (ad.public_id) await cloudinary.uploader.destroy(ad.public_id);
      }));
    }

    if (deletedMagazine.editorial?.public_id) {
      await cloudinary.uploader.destroy(deletedMagazine.editorial.public_id);
    }

    if (deletedMagazine.collectors) {
      await Promise.all(
        deletedMagazine.collectors.map(async (collector: { images: { public_id: string }[] }) => {
          await Promise.all(
            collector.images.map(async (img: { public_id: string }) => {
              if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
            })
          );
        })
      );
    }

    return res.status(200).json({ message: "Magazine deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Failed to delete magazine" });
  }
};

/**
 * @desc Update a Digital Magazine
 * @route PUT /api/digitalMagazine/:id
 */
export const updateMagazine = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (updatedData.image) {
      const imageResult = await cloudinary.uploader.upload(updatedData.image, { folder: "digitalMagazine" });
      updatedData.image = { public_id: imageResult.public_id, url: imageResult.secure_url };
    }

    if (updatedData.pdf) {
      const pdfResult = await cloudinary.uploader.upload(updatedData.pdf, { folder: "digitalMagazine", resource_type: "raw" });
      updatedData.pdf = { public_id: pdfResult.public_id, url: pdfResult.secure_url };
    }

    const updatedMagazine = await updateMagazineById(id, updatedData);
    if (!updatedMagazine) {
      return res.status(404).json({ message: "Magazine not found" });
    }

    return res.status(200).json(updatedMagazine);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Failed to update magazine" });
  }
};