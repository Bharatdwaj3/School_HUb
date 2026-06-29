// model/attendance.model.ts
import mongoose, { Model, Schema, Document } from 'mongoose';

export interface IAttendanceRecord {
  studentId: mongoose.Types.ObjectId;
  status: 'present' | 'absent' | 'late';
}

export interface IAttendance extends Document {
  subjectId: mongoose.Types.ObjectId;
  markedBy: mongoose.Types.ObjectId;
  date: Date;
  records: IAttendanceRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    records: [
      {
        studentId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        status: {
          type: String,
          enum: { values: ['present', 'absent', 'late'], message: 'Invalid status' },
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

attendanceSchema.index({ subjectId: 1, date: 1 }, { unique: true });

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', attendanceSchema, 'attendance');

export default Attendance;