import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB=async ()=>{
    try {
       const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`Mongo DB connecte !!db name:${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("db/index.js Mongo db Connection error",error);
        process.exit(1)
    }
}

export default connectDB;