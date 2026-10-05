require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Apna AI Backend is running 🚀");
});

app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        console.log("User:", message);

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY
                },

                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: message
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.log("Gemini Error:", data);

            return res.status(500).json({
                error: "Gemini API error",
                details: data
            });
        }

        const reply =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Mujhe response nahi mila.";

        console.log("Apna AI:", reply);

        res.json({
            reply: reply
        });

    } catch (error) {
        console.log("Server Error:", error);

        res.status(500).json({
            error: "Server error",
            details: error.message
        });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Apna AI server running at http://localhost:${PORT}`);
});