import mongoose, { Document, Model, Schema, ObjectId } from "mongoose";
import bcrypt from "bcrypt";

interface IUploadedFile {
  public_id: string;
  url: string;
  originalFilename: string;
  fileType: string;
}

interface IUser extends Document {
  name: string;
  family_name: string;
  id_number: string;
  email: string;
  username: string;
  password: string;
  resetPasswordToken: string;
  resetPasswordExpires: Number;
  cellphone: string;
  age: string;
  isVerified: boolean;
  companyId: {
    type: Number;
    required: true;
  };
  occupation:
    | "procurement"
    | "technical_officer"
    | "startup_member"
    | "quality_control"
    | "research_development"
    | "quality_assurance"
    | "student"
    | "other";
  role: "admin" | "provider" | "user";
  sex: "man" | "woman" | "other";
  user_company: 
  | "none"
  | "Kavir_tire"
  | "Barez_tire"
  | "Khoozestan_tire"
  | "Kian_tire"
  | "iran_tire"
  | "razi_tire"
  | "dena_tire"
  | "artavil_tire"
  | "pars_tire"
  | "iranyasa_tire"
  | "yazd_tire"

  image: {
    public_id?: string;
    url?: string;
  };
  ratings: ObjectId[]; // Array of rating ObjectIds
  userTickets: ObjectId[]; // Array of userTickets ObjectIds
  uploadedFiles: IUploadedFile[];
  updateImage: {
    public_id?: string;
    url?: string;
  }
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
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
    updateImage: {
      public_id: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
    },
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
    name: {
      type: String,
      required: true,
    },
    family_name: {
      type: String,
      required: true,
    },
    username: { type: String, required: true, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    cellphone: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpires: { type: Number, required: false },
    id_number: {
      type: String,
      required: true,
      unique: true,
    },
    companyId: {
      type: Number,
      required: false,
    },
    occupation: {
      type: String,
      enum: [
        "procurement",
        "technical_officer",
        "startup_member",
        "quality_control",
        "research_development",
        "quality_assurance",
        "quality_assurance",
        "student",
        "other",
      ],
      default: "other",
    },
    role: {
      type: String,
      enum: ["admin", "provider", "user"],
      default: "user",
    },
    sex: {
      type: String,
      enum: ["man", "woman", "other"],
      default: "other",
    },
    age: {
      type: String,
      enum: ["under", "20-30", "30-40", "40-50", "above", "other"],
      default: "other",
    },
    user_company: {
      type: String,
      enum: [
         "none",
         "Kavir_tire",
         "Barez_tire",
         "Khoozestan_tire",
         "Kian_tire",
         "iran_tire",
         "razi_tire",
         "dena_tire",
         "artavil_tire",
         "pars_tire",
         "iranyasa_tire",
         "yazd_tire",
      ],
      default: "none"
    },
    ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rating" }],
    userTickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "userTickets" }],
    isVerified: { type: Boolean, default: false }, // Boolean f
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
