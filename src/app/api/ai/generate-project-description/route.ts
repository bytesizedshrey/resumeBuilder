import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/api.types";
import { GenerateProjectDescriptionBody } from "@/types/ai.types";
import { generateAiContent } from "@/lib/gemini";


export async function POST(req: NextRequest) {
  try {
    const body: GenerateProjectDescriptionBody = await req.json();

    const { projectTitle, projectType, techStack } = body;

    // Validation
    if (
      !projectTitle ||
      !projectType ||
      !techStack ||
      !Array.isArray(techStack) ||
      techStack.length === 0
    ) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message:
            "Project title, project type and tech stack are required.",
        },
        {
          status: 400,
        }
      );
    }

    // Prompt
    const prompt = `
Generate a professional ATS-friendly resume project description.

Project Details:
- Project Title: ${projectTitle}
- Project Type: ${projectType}
- Technologies Used: ${techStack.join(", ")}

Instructions:
- Write a single paragraph between 80 and 120 words.
- Clearly explain the project's purpose.
- Mention the key features and functionalities.
- Naturally incorporate the listed technologies.
- Highlight the impact or problem solved.
- Use strong action verbs.
- Make it ATS-friendly.
- Do not use bullet points.
- Do not include headings, markdown, or code fences.
- Return only the project description.
`;

    // Generate description
    const projectDescription = await generateAiContent(prompt);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: "Project description generated successfully.",
        data: {
          projectDescription,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in Generate Project Description API:", error);

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