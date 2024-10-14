import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";

interface IUnverifiedUser extends Document {
  name: string;
  family_name: string;
  id_number: string;
  email: string;
  username: string;
  password: string;
  address: string;
  cellphone: string;
  age: string;
  phone: string;
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
  verificationCode: string;
  image: {
    public_id?: string;
    url?: string;
  };
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const unverifiedUserSchema = new Schema<IUnverifiedUser>(
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
    age: {
      type: String,
      required: true,
    },
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
    verificationCode: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

unverifiedUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

unverifiedUserSchema.methods.matchPassword = async function (
  enteredPassword: string
) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const UnverifiedUser = mongoose.model<IUnverifiedUser>(
  "UnverifiedUser",
  unverifiedUserSchema
);

export default UnverifiedUser;
