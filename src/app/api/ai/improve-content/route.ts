import { NextRequest, NextResponse } from "next/server";

import { ImproveContentBody } from "@/types/ai.types";
import { ApiResponse } from "@/types/api.types";
import { generateAiContent } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ImproveContentBody;

    const { content } = body;

    // Validation
    if (!content || !content.trim()) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Content is required.",
        },
        {
          status: 400,
        }
      );
    }

    // Prompt
    const prompt = `
You are an expert resume writer and ATS optimization specialist.
Improve the following resume content to make it sound more professional, action-oriented, and ATS-friendly.

Original Content:
"${content}"

Instructions:
- Keep the length similar to the original content.
- Use strong action verbs at the beginning of bullet points or sentences where appropriate.
- Enhance the professional tone, clarity, and impact.
- Correct any grammatical, spelling, or punctuation errors.
- Preserve all key details, metrics, technologies, and achievements.
- Do not invent any new facts, projects, or credentials.
- Return only the improved content. Do not add any introduction, explanation, markdown formatting, or code blocks.
`;

    // Generate improved content
    const improvedContent = await generateAiContent(prompt);

    if (!improvedContent) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Failed to improve content.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Content improved successfully.",
        data: {
          improvedContent,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in Improve Content API:", error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}