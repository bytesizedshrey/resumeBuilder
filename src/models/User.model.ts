import mongoose from "mongoose";

let userSchema = new mongoose.Schema({
    name:{
        type : String,
        trim : true,
        required : [true,'Name is required']
    },
    email:{
        type : String,
        trim : true,
        required : [true,'Name is required'],
        unique : true
    },
    password: {
        type : String,
        required : [true,'Name is required'],
        minlength : [8,'minumum 8 length required'],
    }
    // role:{

    // }
})