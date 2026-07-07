import { connectDB } from "@/lib/mongodb"
import { RegisterBody } from "@/types/user.types"
import { NextRequest } from "next/server"

async function POST(req:NextRequest){
    try {
        await connectDB()

        let body: RegisterBody = await req.json()

        let {name,email,mobile,password} = body

        if(!name || !email || !password)

    } catch (error) {
        console.log('error in register api',error)
    }
}