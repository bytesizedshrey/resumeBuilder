import { generateToken } from "@/lib/jwt"
import { connectDB } from "@/lib/mongodb"
import UserModel from "@/models/User.model"
import { ApiResponse } from "@/types/api.types"
import { RegisterBody } from "@/types/user.types"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req:NextRequest){
    try {
        await connectDB()

        const body: RegisterBody = await req.json()

        const {name,email,mobile,password} = body

        if(!name || !email || !password){
            return NextResponse.json<ApiResponse>({
                success : false, message : 'All fields are required.'
            },{
                status : 400
            })
        }
        
        const isExisted = await UserModel.findOne({email})

        if(isExisted){
            return NextResponse.json<ApiResponse>({
                success : false , message : 'user already exists with the same email id.'
            },{
                status : 409
            })
        }

        const newUser = await UserModel.create({
            name, email, password, mobile
        })

        const token = generateToken({userId: newUser._id.toString()})

        const response = NextResponse.json<ApiResponse>({
            success : true, message : 'user registered sucessfully',data:{
                user:{
                    _id : newUser._id,
                    name : newUser.name,
                    email: newUser.email
                }
            }
        },{status: 201})

        response.cookies.set('token',token,{
            httpOnly: true,
            sameSite : 'lax',
            maxAge : 60 * 60 * 1000
        })

        return response


    } catch (error) {
        console.log('error in register api',error)
        return NextResponse.json<ApiResponse>({
            success: false, message : 'Something went wrong', error:{
                error
            }
        },{status: 500})
    }
} 