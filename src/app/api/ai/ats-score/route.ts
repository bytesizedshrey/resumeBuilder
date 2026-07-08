import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/api.types";
import { AtsScoreBody } from "@/types/ai.types";
import { generateAiContent } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AtsScoreBody;

    const { resumeText, jobDescription } = body;

    // Validation
    if (!resumeText?.trim() || !jobDescription?.trim()) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Resume text and job description are required.",
        },
        {
          status: 400,
        }
      );
    }

    // Prompt
    const prompt = `
You are an expert ATS (Applicant Tracking System) algorithm and resume reviewer.
Analyze the following resume text against the target job description.

Resume Text:
"""
${resumeText}
"""

Job Description:
"""
${jobDescription}
"""

Instructions:
- Provide an overall ATS match score between 0 and 100.
- Identify matching keywords found in both the resume and the job description.
- Identify critical missing keywords/skills that are in the job description but absent or weak in the resume.
- Provide 3-5 actionable improvement suggestions.
- Return the response strictly as a JSON object with the following schema:
{
  "score": number,
  "matchingKeywords": string[],
  "missingKeywords": string[],
  "suggestions": string[]
}
- Do not include any markdown styling, headings, code blocks, or extra explanatory text outside the JSON. Return only the raw JSON.
`;

    // Generate score details
    const resultText = await generateAiContent(prompt);

    if (!resultText) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Failed to generate ATS score.",
        },
        {
          status: 500,
        }
      );
    }

    let parsedData;
    try {
      const cleanJson = resultText
        .replace(/^\s*```json\s*/i, "")
        .replace(/\s*```\s*$/i, "")
        .trim();
      parsedData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Failed to parse Gemini ATS score JSON:", resultText, parseError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Failed to parse ATS scoring result.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "ATS score calculated successfully.",
        data: parsedData,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in ATS Score API:", error);

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
