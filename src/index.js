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


connectDB()
.then(() => {
  app.on("error", (error) => {
    console.log("Error: ", error);
    throw error
  })
  app.listen(process.env.PORT || 8000, () => {
    console.log(` Server is running at PORT : ${process.env.PORT}`)
  })
})
app.on("err", (err) => {
  console.log("Error aaya h:", err);
  throw err;
})
.catch((err) => {
  console.log("Mongo DB connection fail !!!", err);
})



