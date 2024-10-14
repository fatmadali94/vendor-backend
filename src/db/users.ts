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
  address: string;
  cellphone: string;
  age: string;
  phone: string;
  isVerified: boolean;
  occupation:
    | "procurement"
    | "technical_officer"
    | "startup_member"
    | "quality_control"
    | "research_development"
    | "quality_assurance"
    | "quality_assurance"
    | "student"
    | "other";
  role: "admin" | "provider" | "user";
  sex: "man" | "woman" | "other";
  image: {
    public_id?: string;
    url?: string;
  };
  tickets: ObjectId[]; // Array of ticket ObjectIds
  uploadedFiles: IUploadedFile[];
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
    phone: {
      type: String,
      required: false,
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
    address: {
      type: String,
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
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }],
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
