import { IResume } from "@/types/resume.types";
import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema<IResume>({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
  education:{
    type : [
        {
           institute: String,
           degree : String,
           startDate: String,
           endDate : String,
        }
    ],
    default:[]
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
    },
    default: {}
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


const ResumeModel = mongoose.model('Resume', resumeSchema)

export default ResumeModel