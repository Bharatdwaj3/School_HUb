// model/student.model.ts
import mongoose, { Model, Schema, Document, Types } from 'mongoose';
import '@/model/user.model';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  savedSubjects?: Types.ObjectId[];       
  enrollmentHistory?: Types.ObjectId[];    
  parentId?: mongoose.Types.ObjectId;      
  classId?: mongoose.Types.ObjectId;
  section?: string;
  rollNumber: string,
  dateOfBirth?: Date;
  gender?: string;
  mediaUrl: string;
  address?: string;
  cloudinaryId: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    savedSubjects: [{
      type: Schema.Types.ObjectId,
      ref: 'Subject',
    }],
    enrollmentHistory: [{
      type: Schema.Types.ObjectId,
      ref: 'Subject', 
    }],
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Parent',
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
    },
    section: String,
    rollNumber: { type: String, unique: true, sparse: true },
    dateOfBirth: Date,
    gender: String,
    address: String,
    mediaUrl: { type: String, default: '' },
    cloudinaryId: { type: String, default: '' },
  },
  { timestamps: true }
);

const Student: Model<IStudent> = mongoose.models.Student || mongoose.model<IStudent>('Student', studentSchema, 'students');

export default Student;