import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.listen(process.env.port || 8000),()=>{
        console.log(`app is runnning on ${process.env.port}`);
    };
})
.catch((error)=>{
    console.log("src/index.js mongodb connection error",error);
})
;