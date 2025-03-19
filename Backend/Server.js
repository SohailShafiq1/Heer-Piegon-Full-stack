const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Connection Error:", err));

const newsSchema = new mongoose.Schema({
  name: String,
  text: String,
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const News = mongoose.model("News", newsSchema);

app.get("/api/news", async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: "Error fetching news" });
  }
});

app.post("/api/news", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text)
      return res.status(400).json({ message: "News text is required" });

    // Get total count of news items to assign a unique name
    const count = await News.countDocuments();
    const name = `News ${count + 1}`;

    const newNews = new News({ name, text });
    await newNews.save();
    res.status(201).json(newNews);
  } catch (err) {
    res.status(500).json({ message: "Error saving news" });
  }
});

app.put("/api/news/:id/toggle-publish", async (req, res) => {
  try {
    const { id } = req.params;
    const newsItem = await News.findById(id);

    if (!newsItem) {
      return res.status(404).json({ message: "News not found" });
    }

    newsItem.published = !newsItem.published;
    await newsItem.save();

    res.json(newsItem);
  } catch (err) {
    res.status(500).json({ message: "Error toggling publish status" });
  }
});

app.delete("/api/news/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNews = await News.findByIdAndDelete(id);

    if (!deletedNews) {
      return res.status(404).json({ message: "News not found" });
    }

    res.json({ message: "News deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting news" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
