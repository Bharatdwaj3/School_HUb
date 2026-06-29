// model/subject.model.ts
import { Schema, model, models } from "mongoose";
import '@/model/user.model';

const subjectSchema = new Schema(
  {
    teacherId: {           // was farmerId
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    code: {                
      type: String,
      required: true,
      unique: true,
    },
    credits: {
      type: Number,
      default: 3,
      min: 1,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
    },
    schedule: {
      day: String,
      time: String,
    },
    img: {
      type: String,
      default: "",
    },
    cloudinaryId: {
      type: String,
      default: "",
    },
    isElective: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default models.Subject ?? model("Subject", subjectSchema, "subjects");