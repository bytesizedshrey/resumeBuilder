import { IUser } from "@/types/user.types";
import mongoose from "mongoose";

let userSchema = new mongoose.Schema<IUser >({
  name: {
    type: String,
    trim: true,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    trim: true,
    required: [true, "Name is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Name is required"],
    minlength: [8, "minumum 8 length required"],
  },
  mobile: {
    type: String,
    minlength: [10, "please enter correct phone number."],
    maxlength: [10, "please enter correct phone number."],
  },
  // role:{

  // }
},{
    timestamps : true
});


let UserModel = mongoose.model('User', userSchema)

export default UserModel