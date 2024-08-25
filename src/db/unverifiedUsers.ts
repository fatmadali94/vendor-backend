import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

interface IUnverifiedUser extends Document {
  name: string;
  family_name: string;
  id_number: string;
  email: string;
  username: string;
  password: string;
  address: string;
  cellphone: string;
  phone: string;
  occupation:
    | "purchase_manager"
    | "student"
    | "startup_member"
    | "provider"
    | "observer"
    | "provider"
    | "other";
  role: "admin" | "provider" | "user";
  verificationCode: string;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const unverifiedUserSchema = new Schema<IUnverifiedUser>(
  {
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
      required: true,
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
    id_number: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    occupation: {
      type: String,
      enum: [
        "purchase_manager",
        "startup_member",
        "student",
        "provider",
        "analyzer",
        "observer",
        "other",
      ],
      default: "purchase_manager",
    },
    role: {
      type: String,
      enum: ["admin", "provider", "user"],
      default: "user",
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
