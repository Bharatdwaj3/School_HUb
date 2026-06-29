// model/marks.model.ts
import mongoose, { Model, Schema, Document } from 'mongoose';

export interface IMarks extends Document {
  subjectId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  markedBy: mongoose.Types.ObjectId;
  examType: 'midterm' | 'final' | 'quiz' | 'assignment';
  marks: number;
  totalMarks: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const marksSchema = new Schema<IMarks>(
  {
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    examType: {
      type: String,
      enum: { values: ['midterm', 'final', 'quiz', 'assignment'], message: 'Invalid exam type' },
      required: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

marksSchema.index({ subjectId: 1, studentId: 1, examType: 1 }, { unique: true });

const Marks: Model<IMarks> =
  mongoose.models.Marks || mongoose.model<IMarks>('Marks', marksSchema, 'marks');

export default Marks;