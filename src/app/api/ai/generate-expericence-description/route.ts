import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/api.types";
import { GenerateExperienceDescriptionBody } from "@/types/ai.types";
import { generateAiContent } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body: GenerateExperienceDescriptionBody = await req.json();

    const { company, position, keyResponsibilities, skills } = body;

    // Validation
    if (!company || !position) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Company and position are required.",
        },
        {
          status: 400,
        }
      );
    }

    // Prompt
    const prompt = `
Generate a professional ATS-friendly resume job description/experience detail.

Role Details:
- Company Name: ${company}
- Position/Role: ${position}
${keyResponsibilities ? `- Key Responsibilities/Achievements: ${keyResponsibilities}` : ""}
${skills && skills.length > 0 ? `- Skills/Tools Used: ${skills.join(", ")}` : ""}

Instructions:
- Write a single professional paragraph between 80 and 120 words.
- Focus on accomplishments, impact, and action-oriented statements.
- Naturally integrate the listed skills/tools if provided.
- Use strong action verbs (e.g., Led, Developed, Optimized, Managed).
- Keep it concise, professional, and ATS-optimized.
- Do not use bullet points.
- Do not include headings, markdown, or code fences.
- Return only the generated experience description.
`;

    // Generate description
    const experienceDescription = await generateAiContent(prompt);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Experience description generated successfully.",
        data: {
          experienceDescription,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in Generate Experience Description API:", error);

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
