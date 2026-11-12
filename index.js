import express from 'express';
import cors from "cors";
import "dotenv/config";
import { MongoClient } from 'mongodb';
import multer from 'multer';

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

// Upload Managing with Multer \\
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 32 * 1024 * 1024,
    },
});

// Middleware \\
app.use(express.json());

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

// Upload An Image To ImgBB \\
app.post("/upload-image", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please select an image.",
            });
        }

        if (!req.file.mimetype.startsWith("image/")) {
            return res.status(400).json({
                message: "Only image files are allowed.",
            });
        }

        const formData = new FormData();

        formData.append(
            "image",
            new Blob([new Uint8Array(req.file.buffer)], {
                type: req.file.mimetype,
            }),
            req.file.originalname
        );

        const response = await fetch(
            `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            return res.status(500).json({
                message: "Image upload failed.",
            });
        }

        res.status(200).json({
            imageUrl: data.data.url,
        });
    } catch (error) {
        console.error("Image upload error:", error);

        res.status(500).json({
            message: "Something went wrong while uploading the image.",
        });
    }
});

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

// Get All Studios \\
app.get('/studios', async (req, res) => {
    try {
        const data = await studiosCollection.find().toArray()
        res.send(data)
    }
    catch (error) {
        console.log("Failed to fetch", error)
        res.status(500).json({
            message: "Failed to fetch studios",
        });
    }
})


// -------------------------------------------------\\
app.get('/', (req, res) => {
    res.send("StudioSpace API is running!");
})

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})