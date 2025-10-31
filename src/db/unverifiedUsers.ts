import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";

interface IUnverifiedUser extends Document {
  name: string;
  family_name: string;
  id_number: string;
  email: string;
  username: string;
  password: string;
  cellphone: string;
  age: string;
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
  user_company: 
  | "none"
  | "kavir_tire"
  | "barez_tire"
  | "barezkordestan_tire"
  | "khoozestan_tire"
  | "kian_tire"
  | "iran_tire"
  | "razi_tire"
  | "dena_tire"
  | "artavil_tire"
  | "pars_tire"
  | "iranyasa_tire"
  | "yazd_tire"
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
    user_company: {
      type: String,
      enum: [
         "none",
         "kavir_tire",
         "barez_tire",
         "barezkordestan_tire",
         "khoozestan_tire",
         "kian_tire",
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
