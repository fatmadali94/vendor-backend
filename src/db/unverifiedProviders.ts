import mongoose, { Document, Model, Schema, ObjectId } from "mongoose";
import bcrypt from "bcrypt";

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

interface IUnverifiedProvider extends Document {
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
  username: string;
  records: (MaterialRecord | PartRecord)[];
  role: "admin" | "provider";
  verificationCode: string;
  image: {
    public_id?: string;
    url?: string;
  };
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const unverifiedProviderSchema = new Schema<IUnverifiedProvider>({
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
  verificationCode: {
    type: String,
    required: true,
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
