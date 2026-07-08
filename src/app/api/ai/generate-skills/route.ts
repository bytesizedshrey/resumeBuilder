import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

import { GenerateSummaryBody } from "@/types/ai.types";
import { ApiResponse } from "@/types/api.types";
import { generateAiContent } from "@/lib/gemini";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body: GenerateSummaryBody = await req.json();

    const { experienceLevel, jobTitle } = body;

    // Validation
    if (
      !experienceLevel ||
      !jobTitle
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
    Generate a list of professional resume skills for the following candidate.
    
    Candidate Details:
    - Experience Level: ${experienceLevel}
    - Job Title: ${jobTitle}
    
    Instructions:
    - Generate 10-15 relevant technical and soft skills.
    - Include only skills that are commonly expected for this job title and experience level.
    - Prioritize ATS-friendly keywords.
    - Avoid duplicate or overly generic skills.
    - Return the response as a JSON array of strings.
    - Do not include any explanations, headings, markdown, or code fences.
    
    Example:
    [
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "REST APIs",
      "Git",
      "Problem Solving",
      "Communication",
      "Team Collaboration"
    ]
    `;

    // Gemini API
    const result = await generateAiContent(prompt)
    const skills = result

    return NextResponse.json<ApiResponse>({
        success : true, message:"skills created", data:{
            skills
        }
    },{
        status : 201
    })
  } catch (error) {
    console.error("Error in Generate skills API:", error);

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
