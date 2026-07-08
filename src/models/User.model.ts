import { IUser } from "@/types/user.types";
import mongoose,{Document} from "mongoose";
import bcrypt from 'bcrypt'

interface UserDocument extends Omit<IUser, '_id'>,Document{
    comparePass(candidatePassword:string):boolean
}

const userSchema = new mongoose.Schema<UserDocument>({
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

//Before .save() actually stores the user in MongoDB, this function runs.
/**
 * pre = run before
'save' = before a document is saved
 */
/**
 * --------
 *  this.isModified('password')
     This checks:
      "Has the password changed?"
 --------------------------*/
userSchema.pre('save',function():void{
    if(!this.isModified('password'))return
    this.password = bcrypt.hashSync(this.password,10)
})
//compare the password
userSchema.methods.comparePass = function(candidatePassword:string):boolean{
    return bcrypt.compareSync(candidatePassword,this.password)
}

const UserModel = mongoose.model('User', userSchema)
export default UserModel  