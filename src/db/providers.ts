import mongoose, { Document, Model, Schema, ObjectId } from "mongoose";
import MessageSchema from "./messages";
import Rating from "./rating";
import bcrypt from "bcrypt";
import Comment from "./comments";

interface IUploadedFile {
  public_id: string;
  url: string;
  originalFilename: string;
  fileType: string;
}

interface MaterialRecord {
  materialgroup?: ObjectId;
  materialname?: ObjectId;
  materialgrade?: ObjectId;
}

interface PartRecord {
  partgroup?: ObjectId;
  partname?: ObjectId;
  partgeneralid?: ObjectId;
}

// Define the schema for reviews
// interface Review {
//   reviewer: ObjectId;
//   rating: number; // Rating out of 5, for example
//   comment?: string; // Optional comment field
//   timestamp: Date;
// }

interface IUser extends Document {
  description: string;
  fax_number: string;
  ceo_name: string;
  company_name: string;
  phone: string;
  cellphone: string;
  id_number: string;
  foundation_year: string;
  postal_code: string;
  economical_number: string;
  email: string;
  company_type: string;
  export: string;
  knowledgebased: string;
  website_address: string;
  country: string;
  city: string;
  form_filler_name: string;
  form_filler_position: string;
  address: string;
  password: string;
  resetPasswordToken: string;
  resetPasswordExpires: Number;
  username: string;
  records: (MaterialRecord | PartRecord)[];
  // updatedRecords: (MaterialRecord | PartRecord)[];
  role: "admin" | "provider" | "user";
  messages: mongoose.Schema.Types.ObjectId[] | (typeof MessageSchema)[]; // Updated to include messageSchema
  comments: Comment[]; // Array of comments
  ratings: mongoose.Schema.Types.ObjectId[] | (typeof Rating)[]; // Array of rating references
  isVerified: boolean;
  image: {
    public_id?: string;
    url?: string;
  };
  // updateImage: {
  //   public_id?: string;
  //   url?: string;
  // }
  uploadedFiles: IUploadedFile[];
  matchPassword(enteredPassword: string): Promise<boolean>;
  providerTickets: ObjectId[]; // Array of providerTickets ObjectIds
}

const providerSchema = new Schema<IUser>({

  uploadedFiles: [
    {
      public_id: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
      fileType: {
        type: String,
        required: false, // The file type (e.g., 'pdf', 'jpeg', etc.)
      },
      originalFilename: {
        type: String,
        required: false,
      },
    },
  ], 
  description: {
    type: String,
  required: false
  },
  fax_number: {
    type: String,
  required: false,
  },
  ceo_name: {
    type: String,
  required: false
  },
  image: {
    public_id: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
  },
  // updateImage: {
  //   public_id: {
  //     type: String,
  //     required: false,
  //   },
  //   url: {
  //     type: String,
  //     required: false,
  //   },
  // },
  company_name: {
    type: String,
    required: false,
  },
  company_type: {
    required: false,
    type: String,
  },
  export: {
    required: false,
    type: String,
  },
  knowledgebased: {
    required: false,
    type: String,
  },
  username: {
    required: true,
    type: String,
  },
  website_address: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: false,
  },
  cellphone: {
    type: String,
    required: false,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  id_number: {
    type: String,
    required: false,
    unique: true,
  },
  foundation_year: {
    type: String,
    required: false,
  },
  postal_code: {
    type: String,
    required: false,
  },
  economical_number: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: false,
  },
  country: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: false,
  },
  form_filler_name: {
    type: String,
    required: false,
  },
  form_filler_position: {
    type: String,
    required: false,
  },

  records: [
    {
      materialgroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MaterialGroups",
        required: false,
      },
      materialname: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MaterialNames",
        required: false,
      },
      materialgrade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MaterialGrades",
        required: false,
      },
    },
    {
      partgroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PartGroups",
        required: false,
      },
      partname: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PartNames",
        required: false,
      },
      partgeneralid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PartGeneralIds",
        required: false,
      },
    },
  ],
  // updatedRecords: [
  //   {
  //     materialgroup: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "MaterialGroups",
  //       required: false,
  //     },
  //     materialname: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "MaterialNames",
  //       required: false,
  //     },
  //     materialgrade: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "MaterialGrades",
  //       required: false,
  //     },
  //   },
  //   {
  //     partgroup: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "PartGroups",
  //       required: false,
  //     },
  //     partname: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "PartNames",
  //       required: false,
  //     },
  //     partgeneralid: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "PartGeneralIds",
  //       required: false,
  //     },
  //   },
  // ],
  messages: [MessageSchema], // Correct usage of messageSchema here
  ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rating" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  providerTickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "providerTickets" }],

  isVerified: { type: Boolean, default: false }, // Boolean f
  role: {
    type: String,
    enum: ["admin", "provider", "user"],
    default: "provider",
  },
});

providerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

providerSchema.methods.matchPassword = async function (
  enteredPassword: string
) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Provider = mongoose.model<IUser>("Provider", providerSchema);

export const getVerifiedProviders = () => {
  const verifiedProviders = Provider.find()
    .populate({
      path: "records.materialgroup",
      model: "MaterialGroups", // Ensures that Mongoose knows which model to use for population
    })
    .populate({
      path: "records.materialname",
      model: "MaterialNames", // Similarly, define the model for material names
    })
    .populate({
      path: "records.materialgrade",
      model: "MaterialGrades", // And for material grades
    })
    .populate({
      path: "records.partgroup",
      model: "PartGroups", 
    })
    .populate({
      path: "records.partname",
      model: "PartNames", 
    })
    .populate({
      path: "records.partgeneralId",
      model: "PartGeneralId", 
    })
    .populate({
      path: "ratings",
      model: "Rating",
      // select: "position companyId rating", // Only select specific fields from Rating
    })
    .populate({
      path: "comments",
      model: "Comment",
      // select: "position companyId rating", // Only select specific fields from Rating
    })
    .exec();

  return verifiedProviders;
};
export const getVerifiedProviderById = (id: any) =>
  Provider.findById(id)
    .populate({
      path: "records.materialgroup",
      model: "MaterialGroups", // Ensures that Mongoose knows which model to use for population
    })
    .populate({
      path: "records.materialname",
      model: "MaterialNames", // Similarly, define the model for material names
    })
    .populate({
      path: "records.materialgrade",
      model: "MaterialGrades", // And for material grades
    })
    .populate({
      path: "records.partgroup",
      model: "PartGroups", 
    })
    .populate({
      path: "records.partname",
      model: "PartNames", 
    })
    .populate({
      path: "records.partgeneralId",
      model: "PartGeneralId", 
    })
    .populate({
      path: "ratings",
      model: "Rating",
      // select: "position companyId rating", // Only select specific fields from Rating
    })
    .populate({
      path: "comments",
      model: "Comment",
      // select: "position companyId rating", // Only select specific fields from Rating
    })
    .exec();

export default Provider;
