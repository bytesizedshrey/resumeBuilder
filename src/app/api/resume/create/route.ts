import { getCurrentUser } from "@/lib/getCurrentUser";
import { connectDB } from "@/lib/mongodb";
import ResumeModel from "@/models/Resume.model";
import { ApiResponse } from "@/types/api.types";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await connectDB();

    const userId = await getCurrentUser();

    const newResume = await ResumeModel.create({
      user_id: userId,
      title: "",
      summary: "",
      personalInfo: {},
      workExperience: [],
      projects: [],
      education: [],
      certifications: [],
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "resume created successfully",
        data: {
          resume: newResume,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("error in create resume api", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}