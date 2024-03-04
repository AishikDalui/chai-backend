import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}
))

app.use(express.json({limit:"16kb"})) //accept all types of json files and datas
app.use(express.urlencoded({ extended:true,
    limit:"16kb"

})) //accept all kind of url " hello world= hello+world";

app.use(express.static("pulic")) //any static files(img,video) came then it will be stroe in public folder

app.use(cookieParser())

export {app};