// model/parent.model.ts
import mongoose, { Schema, model, models, Document } from 'mongoose';
import '@/model/user.model';

export interface IParent extends Document {
  userId: mongoose.Types.ObjectId;
  children?: mongoose.Types.ObjectId[];
  location?: {
    address?: string;
  };
  savedSubjects?: mongoose.Types.ObjectId[];
  mediaUrl: string;
  cloudinaryId: string;
  createdAt: Date;
  updatedAt: Date;
}

const parentSchema = new Schema<IParent>(

  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    children: [{
      type: Schema.Types.ObjectId,
      ref: 'Student',
    }],
    location: {
  address: { type: String, trim: true },
},
    savedSubjects: [{
      type: Schema.Types.ObjectId,
      ref: 'Subject',
    }],
    mediaUrl: { type: String, default: '' },
    cloudinaryId: { type: String, default: '' },
  },
  { timestamps: true }
);

export default models.Parent ?? model('Parent', parentSchema, 'parents');