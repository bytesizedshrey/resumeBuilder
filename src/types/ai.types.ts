export interface GenerateSummaryBody{
    experienceLevel : string;
    skills : string[];
    jobTitle : string;
}

export interface GenerateSkillsBody{
    experienceLevel : string,
    jobTitle : string
}

export interface GenerateProjectDescriptionBody {
    projectTitle: string;
    projectType: string;
    techStack: string[];
}

export interface GenerateExperienceDescriptionBody {
    company: string;
    position: string;
    keyResponsibilities?: string;
    skills?: string[];
}