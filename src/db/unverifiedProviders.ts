import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";

interface IUnverifiedProvider extends Document {
  company_name: string;
  phone: number;
  cellphone: number;
  id_number: number;
  ceo_cellphone: number;
  foundation_year: number;
  postal_code: number;
  fax_number: number;
  economical_number: number;
  email: string;
  ceo_name: string;
  website_address: string;
  country: string;
  city: string;
  form_filler_name: string;
  form_filler_position: string;
  address: string;
  password: string;
  username: string;
  role: "admin" | "provider";
  verificationCode: string;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const unverifiedProviderSchema = new Schema<IUnverifiedProvider>({
  company_name: {
    type: String,
    required: true,
  },
  ceo_name: {
    required: true,
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
    type: Number,
    required: true,
  },
  ceo_cellphone: {
    type: Number,
    required: true,
  },
  cellphone: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  id_number: {
    type: Number,
    required: true,
    unique: true,
  },
  foundation_year: {
    type: Number,
    required: false,
  },
  postal_code: {
    type: Number,
    required: false,
  },
  fax_number: {
    type: Number,
    required: false,
  },
  economical_number: {
    type: Number,
    required: false,
    unique: true,
  },

  address: {
    type: String,
    required: true,
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
    required: true,
  },
  form_filler_position: {
    type: String,
    required: true,
  },
  verificationCode: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "provider", "user"],
    default: "provider",
  },
});

unverifiedProviderSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

unverifiedProviderSchema.methods.matchPassword = async function (
  enteredPassword: string
) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const UnverifiedProvider = mongoose.model<IUnverifiedProvider>(
  "unverifiedProvider",
  unverifiedProviderSchema
);

export default UnverifiedProvider;
