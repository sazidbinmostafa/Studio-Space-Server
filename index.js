import express from 'express';
import cors from "cors";
import "dotenv/config";
import { MongoClient } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB \\
const client = new MongoClient(process.env.MONGODB_URI);

export const ConnectMongoDB = async () => {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        return client
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

const mongoClient = await ConnectMongoDB();
const db = mongoClient.db("studio-space");
const studiosCollection = db.collection("studios");

// Middleware \\
app.use(express.json());

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

// POST A Studio \\
app.post('/add-studio', async (req, res) => {
    try {
        const studioData = req.body;
        const result = await studiosCollection.insertOne(studioData);
        res.send(result);
    }
    catch (error) {
        console.error("Error adding studio:", error);
        res.status(500).json({
            message: "Failed to add studio.",
        });
    }
})

app.get('/', (req, res) => {
    res.send("StudioSpace API is running!");
})

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})