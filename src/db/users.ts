import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";

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
  occupation:
    | "purchase_manager"
    | "student"
    | "startup_member"
    | "provider"
    | "observer"
    | "provider"
    | "other";
  role: "admin" | "provider" | "user";
  sex: "man" | "woman" | "other";
  image: {
    public_id?: string;
    url?: string;
  };
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
