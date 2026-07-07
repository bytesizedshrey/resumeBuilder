import { IResume } from "@/types/resume.types";
import mongoose from "mongoose";

let resumeSchema = new mongoose.Schema<IResume>({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
  summary: {
    type: String,
    default: "",
  },
  personalInfo:{
    type : {
        fullname:String,
        email : String,
        mobile : String,
        location : String,
        github : String,
        portfolio : String
    }
  },
  workExperience: {
    type: [
      {
        company: String,
        position: String,
        startDate: String,
        endDate: String,
        desciption: String,
      },
    ],
    default: [],
  },
  projects: {
    type: [
      {
        title: String,
        desciption: String,
        githubUrl: String,
        liveUrl: String,
        techStack: [String],
      },
    ],
  },
  skills:{
    type: [String],
    default: []
  },
  certifications:{
    type:[String],
    default : []
  }
},{
    timestamps : true
});
