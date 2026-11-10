import express from 'express';
import cors from "cors";
import "dotenv/config";
import { MongoClient } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 5000;

const client = new MongoClient(process.env.MONGODB_URI);

export const ConnectMongoDB = async () =>{
    try{
        await client.connect();
        console.log("Connected to MongoDB");
        return client
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

ConnectMongoDB()

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.get('/', (req, res)=>{
    res.send("StudioSpace API is running!");
})

app.listen(PORT, ()=>{
    console.log(`Server is running on port: ${PORT}`)
})