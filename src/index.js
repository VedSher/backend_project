//require ('dotenv').config({path: './env'});

import dotenv from "dotenv"
import connectDB from "./db/index.js";

import mongoose from "mongoose";
import { DB_NAME } from "./constants.js"
import express from "express"
const app = express()

dotenv.config({
  path: './env'
})

connectDB();



// ( async () => {
//   try {
//     await mongoose.connect(`${process.env.
//       MONGO_URL}/${DB_NAME}`)
//       app.on("error", (err) => {
//         console.log("Error aya hai: ",err);
//         throw err
//       })

//       app.listen(process.env.PORT, () => {
//         console.log(`App is Listening on port ${process.env.PORT}`);
//       })
//   }catch (err){
//     console.error("ERROR: ", err);
//     throw err
//   }
// }) ()