import { NextRequest, NextResponse } from "next/server";

import { GenerateSummaryBody } from "@/types/ai.types";
import { ApiResponse } from "@/types/api.types";
import { generateAiContent } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body: GenerateSummaryBody = await req.json();

    const { experienceLevel, skills, jobTitle } = body;

    // Validation
    if (
      !experienceLevel ||
      !jobTitle ||
      !skills ||
      !Array.isArray(skills) ||
      skills.length === 0
    ) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Experience level, job title and skills are required.",
        },
        {
          status: 400,
        },
      );
    }

    // Prompt
    const prompt = `
Generate a professional ATS-friendly resume summary.

Candidate Details:
- Experience Level: ${experienceLevel}
- Job Title: ${jobTitle}
- Skills: ${skills.join(", ")}

Instructions:
- Write in first person.
- Keep it between 60 and 100 words.
- Make it ATS-friendly.
- Highlight the candidate's strongest skills.
- Use confident and professional language.
- Do not use bullet points.
- Return only the summary.
`;

    // Gemini API
    const result = await generateAiContent(prompt)
    const summary = result

    return NextResponse.json<ApiResponse>({
        success : true, message:"Summary created", data:{
            summary
        }
    },{
        status : 201
    })
  } catch (error) {
    console.error("Error in Generate Summary API:", error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Something went wrong.",
      },
      {
        status: 500,
      },
    );
  }
}
