/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/faculty/profile/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import Faculty from "@/model/faculty.model";
import "@/model/subject.model";
import User from "@/model/user.model";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { connectDB } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const faculty = await Faculty.findOne({ userId: id }).populate("userId", "userName fullName email role avatar").populate("subjects", "name description credits isElective img");

    if (!faculty) {
      return NextResponse.json(
        { success: false, message: "Faculty profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, faculty });
  } catch (error) {
    console.error("Get faculty error:", error);
    return NextResponse.json(
     { success: false, message: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!["teacher"].includes(user.role || "") && user.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 }
    );
  }

  if (user.id !== id && user.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "You can only update your own profile" },
      { status: 403 }
    );
  }


 const updateData: Record<string, any> = {};

  try {
    const body = await req.json();
    Object.assign(updateData, body);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No data provided to update" },
        { status: 400 }
      );
    }

    const updated = await Faculty.findOneAndUpdate(
      { userId: id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Faculty profile updated successfully",
      faculty: updated,
    });
  } catch (error) {
    console.error("Update faculty error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (currentUser.id !== id && currentUser.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    await User.findByIdAndDelete(id);
    await Faculty.findOneAndDelete({ userId: id });
    return NextResponse.json({
      success: true,
      message: "Faculty account deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
