import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import ResumeModel from "@/models/Resume.model";
import { ApiResponse } from "@/types/api.types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ resumeId: string }> }) {
  try {
    await connectDB();

    const userId = await getCurrentUser();

    const { resumeId } = await params;

    const resume = await ResumeModel.findOne({
      _id: resumeId,
      user_id: userId,
    });

    if (!resume) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Resume not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Resume fetched successfully.",
        data: {
          resume,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("error in get resume api", error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "something went wrong",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ resumeId: string }> }) {
  try {
    await connectDB();

    const userId = await getCurrentUser();
    const { resumeId } = await params;

    const body = await req.json();

    // Prevent updating user_id or _id directly
    delete body._id;
    delete body.user_id;

    const updatedResume = await ResumeModel.findOneAndUpdate(
      { _id: resumeId, user_id: userId },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedResume) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Resume not found or unauthorized.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Resume updated successfully.",
        data: {
          resume: updatedResume,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("error in update resume api", error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "something went wrong",
      },
      { status: 500 }
    );
  }
}