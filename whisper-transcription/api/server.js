const express = require("express");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const upload = multer();

app.post("/api/transcribe", upload.single("file"), async (req, res) => {
  const file = req.file;
  const apiKey = req.body.apiKey;

  if (!file || !apiKey) {
    return res.status(400).json({ error: "File and API key are required." });
  }

  try {
    const formData = new FormData();
    formData.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    formData.append("model", "whisper-1");

    const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", formData, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        ...formData.getHeaders(),
      },
    });

    res.json({ text: response.data.text });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    res.status(500).json({ error: "Error transcribing audio." });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
