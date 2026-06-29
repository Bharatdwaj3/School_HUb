// model/faculty.model.ts
import mongoose, { Schema, model, Document, models } from 'mongoose';
import '@/model/user.model';

export interface IFaculty extends Document {
  userId: mongoose.Types.ObjectId;
  employeeId?: string;
  designation?: string;
  subjects?: mongoose.Types.ObjectId[];       
  qualifications?: string[];
  department?: string;
  location?: {
    address?: string;
  };
  mediaUrl: string;
  cloudinaryId: string;
  createdAt: Date;
  updatedAt: Date;
}

const facultySchema = new Schema<IFaculty>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    subjects: [{
      type: Schema.Types.ObjectId,
      ref: 'Subject',
    }],
    qualifications: [String],
    department: String,
    location: {
      address: { type: String, trim: true },
    },
    mediaUrl: { type: String, default: '' },
    cloudinaryId: { type: String, default: '' },
  },
  { timestamps: true }
);

export default models.Faculty ?? model<IFaculty>('Faculty', facultySchema, 'faculty');