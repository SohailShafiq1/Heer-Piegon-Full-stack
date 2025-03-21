const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const multer = require("multer");
const app = express();
app.use("/uploads", express.static("uploads"));
const path = require("path");
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(cors());
app.use(express.json());

const fs = require("fs");

const uploadDir = path.join(__dirname, "uploads");
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only JPEG, JPG, and PNG files are allowed"));
  },
});

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Connection Error:", err));

// News Schema & Model
const newsSchema = new mongoose.Schema({
  name: String,
  text: String,
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const News = mongoose.model("News", newsSchema);

// 📰 News Routes
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

    if (!newsItem) return res.status(404).json({ message: "News not found" });

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

    if (!deletedNews)
      return res.status(404).json({ message: "News not found" });

    res.json({ message: "News deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting news" });
  }
});

// 📌 Tournament Schema & Model
const tournamentSchema = new mongoose.Schema({
  name: String,
  startDate: String,
  endDate: String,
  pigeons: Number,
});
const Tournament = mongoose.model("Tournament", tournamentSchema);

// 📌 Create a tournament
app.post("/api/tournaments", async (req, res) => {
  try {
    const tournament = new Tournament(req.body);
    await tournament.save();
    res.status(201).send(tournament);
  } catch (error) {
    console.error("Error creating tournament:", error);
    res.status(500).send({ message: "Error creating tournament", error });
  }
});

// 📌 Get all tournaments
app.get("/api/tournaments", async (req, res) => {
  try {
    const tournaments = await Tournament.find();
    res.json(tournaments);
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    res.status(500).json({ message: "Error fetching tournaments" });
  }
});

// 📌 Delete a tournament and its participants
app.delete("/api/tournaments/:id", async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ message: "Tournament not found" });

    // Delete all participants linked to this tournament
    await Participant.deleteMany({ tournamentId: req.params.id });

    // Delete the tournament itself
    await Tournament.findByIdAndDelete(req.params.id);

    res.json({
      message: "✅ Tournament and all participants deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tournament:", error);
    res.status(500).json({ message: "Error deleting tournament" });
  }
});

//to update the tournament
app.put("/api/tournaments/:id", async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(tournament);
  } catch (error) {
    console.error("Error updating tournament:", error);
    res.status(500).json({ message: "Error updating tournament" });
  }
});

app.get("/api/tournaments/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid tournament ID" });
    }

    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res.json(tournament);
  } catch (error) {
    console.error("Error fetching tournament:", error);
    res.status(500).json({ message: "Error fetching tournament" });
  }
});
const participantSchema = new mongoose.Schema({
  name: String,
  address: String,
  pigeons: [String], // Array of pigeon names or IDs
  tournamentId: mongoose.Schema.Types.ObjectId,
  imagePath: String,
  flightData: [
    {
      date: Date,
      pigeon: String,
      startTime: String, // Store timestamps instead of strings
      endTime: String,
      flightTime: { type: Number, default: null }, // Null for lofted pigeons
      lofted: { type: Boolean, default: false }, // ✅ New flag for lofted pigeons
    },
  ],
});

const Participant = mongoose.model("Participant", participantSchema);

// 📌 Add a participant (with image upload)
app.post("/api/participants", upload.single("image"), async (req, res) => {
  try {
    const { name, address, tournamentId, pigeons } = req.body;

    let pigeonArray = [];

    // If pigeons is a number, generate pigeon names
    if (!isNaN(pigeons) && Number(pigeons) > 0) {
      pigeonArray = Array.from(
        { length: Number(pigeons) },
        (_, i) => `Pigeon ${i + 1}`
      );
    } else {
      return res.status(400).json({ message: "Invalid pigeon count" });
    }

    const participant = new Participant({
      name,
      address,
      pigeons: pigeonArray,
      tournamentId,
      imagePath: req.file
        ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
        : "",
    });

    await participant.save();
    res.status(201).json(participant);
  } catch (error) {
    console.error("Error adding participant:", error);
    res.status(500).json({ message: "Error adding participant" });
  }
});
// 📌 Get participants for a tournament (Fixed)
app.get("/api/tournaments/:id/participants", async (req, res) => {
  try {
    const participants = await Participant.find({ tournamentId: req.params.id })
      .select("name address imagePath pigeons")
      .lean();

    if (!participants || participants.length === 0) {
      return res.status(404).json({ message: "No participants found" });
    }

    const participantsWithPigeonsCount = participants.map((participant) => ({
      ...participant,
      pigeonsCount: participant.pigeons.length, // Fix: Return count instead of array
    }));

    res.json(participantsWithPigeonsCount);
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ message: "Error fetching participants" });
  }
});

// 📌 Update participant details
app.put("/api/participants/:id", async (req, res) => {
  try {
    const participant = await Participant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(participant);
  } catch (error) {
    console.error("Error updating participant:", error);
    res.status(500).json({ message: "Error updating participant" });
  }
});

app.post("/api/participants/:id/flight", async (req, res) => {
  try {
    const { id } = req.params;
    const { date, pigeon, startTime, endTime, lofted } = req.body;

    const participant = await Participant.findById(id);
    if (!participant)
      return res.status(404).json({ message: "Participant not found" });

    if (!participant.pigeons.includes(pigeon)) {
      return res.status(400).json({ message: "Invalid pigeon selection" });
    }

    const tournament = await Tournament.findById(participant.tournamentId);
    if (!tournament)
      return res.status(404).json({ message: "Tournament not found" });

    const tournamentStart = new Date(tournament.startDate);
    const tournamentEnd = new Date(tournament.endDate);
    const selectedDate = new Date(date);

    if (selectedDate < tournamentStart || selectedDate > tournamentEnd) {
      return res.status(400).json({
        message: "Selected date is outside the tournament date range.",
      });
    }

    // ✅ Check existing flights for this date
    const flightsOnDate = participant.flightData.filter(
      (f) =>
        new Date(f.date).toISOString().split("T")[0] ===
        selectedDate.toISOString().split("T")[0]
    );

    if (flightsOnDate.length >= tournament.pigeons) {
      return res.status(400).json({
        message: `You can only add flight data for up to ${tournament.pigeons} pigeons per day.`,
      });
    }

    // ✅ If the pigeon is lofted, mark it as such
    if (lofted) {
      const existingFlightIndex = participant.flightData.findIndex(
        (f) =>
          new Date(f.date).toISOString().split("T")[0] ===
            selectedDate.toISOString().split("T")[0] && f.pigeon === pigeon
      );

      if (existingFlightIndex !== -1) {
        participant.flightData[existingFlightIndex].startTime = null;
        participant.flightData[existingFlightIndex].endTime = null;
        participant.flightData[existingFlightIndex].flightTime = "loft";
        participant.flightData[existingFlightIndex].lofted = true;
      } else {
        participant.flightData.push({
          date,
          pigeon,
          startTime: null,
          endTime: null,
          flightTime: null,
          lofted: true,
        });
      }

      await participant.save();
      return res.json({
        message: "Pigeon marked as lofted successfully",
        flightData: participant.flightData,
      });
    }

    // ✅ Validate that end time is after start time
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    if (end <= start) {
      return res
        .status(400)
        .json({ message: "End time must be after start time." });
    }

    const flightTime = Math.abs(end - start) / 1000; // Convert to seconds

    const existingFlightIndex = participant.flightData.findIndex(
      (f) =>
        new Date(f.date).toISOString().split("T")[0] ===
          selectedDate.toISOString().split("T")[0] && f.pigeon === pigeon
    );

    if (existingFlightIndex !== -1) {
      participant.flightData[existingFlightIndex].startTime = startTime;
      participant.flightData[existingFlightIndex].endTime = endTime;
      participant.flightData[existingFlightIndex].flightTime = flightTime;
      participant.flightData[existingFlightIndex].lofted = false; // Reset lofted status
    } else {
      participant.flightData.push({
        date,
        pigeon,
        startTime,
        endTime,
        flightTime,
        lofted: false, // Default to not lofted
      });
    }

    await participant.save();
    res.json({
      message: "Flight data saved successfully",
      flightData: participant.flightData,
    });
  } catch (error) {
    console.error("Error saving flight data:", error);
    res.status(500).json({ message: "Error saving flight data" });
  }
});

app.get("/api/participants/:id/flight", async (req, res) => {
  try {
    const { id } = req.params;
    const { date, pigeon } = req.query;

    const participant = await Participant.findById(id);
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Convert the requested date to ISO string (only YYYY-MM-DD)
    const formattedDate = new Date(date).toISOString().split("T")[0];

    // Find the flight record where both date and pigeon match
    const flightRecord = participant.flightData.find((f) => {
      return (
        new Date(f.date).toISOString().split("T")[0] === formattedDate &&
        f.pigeon === pigeon
      );
    });

    if (!flightRecord) {
      return res
        .status(200)
        .json({ message: "No flight data found", flightData: null });
    }

    res.json(flightRecord);
  } catch (error) {
    console.error("Error fetching flight data:", error);
    res.status(500).json({ message: "Error fetching flight data" });
  }
});

app.delete("/api/participants/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedParticipant = await Participant.findByIdAndDelete(id);

    if (!deletedParticipant)
      return res.status(404).json({ message: "Participant not found" });

    res.json({
      message: "✅ Participant and flight data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting participant:", error);
    res.status(500).json({ message: "Error deleting participant" });
  }
});

app.get("/api/participants/:id/flights", async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    console.log("Fetching flights for participant ID:", id);
    console.log("Requested date:", date);

    const participant = await Participant.findById(id);

    if (!participant) {
      console.log("Participant not found!");
      return res.status(404).json({ message: "Participant not found" });
    }

    console.log("Participant found:", participant.name);

    // Ensure flightData exists and is an array
    if (!participant.flightData || !Array.isArray(participant.flightData)) {
      console.log("No flight data available for this participant.");
      return res.json({ message: "No flight data found", flightData: [] });
    }

    if (!date) {
      console.log("No specific date provided, returning all flight data.");
      return res.json({ flightData: participant.flightData });
    }

    // Convert date to ISO format (YYYY-MM-DD) for comparison
    const formattedDate = new Date(date).toISOString().split("T")[0];
    console.log("Formatted date:", formattedDate);

    const flightRecords = participant.flightData.filter(
      (f) => new Date(f.date).toISOString().split("T")[0] === formattedDate
    );

    console.log("Flights found:", flightRecords.length);

    res.json({ flightData: flightRecords });
  } catch (error) {
    console.error("Error fetching flight data:", error);
    res.status(500).json({ message: "Error fetching flight data" });
  }
});

app.post("/api/participants/:id/flight/loft", async (req, res) => {
  try {
    const { id } = req.params;
    const { date, pigeon } = req.body;

    const participant = await Participant.findById(id);
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    if (!participant.pigeons.includes(pigeon)) {
      return res.status(400).json({ message: "Invalid pigeon selection" });
    }

    const formattedDate = new Date(date).toISOString().split("T")[0];

    // Find existing flight entry
    const existingFlightIndex = participant.flightData.findIndex(
      (f) =>
        new Date(f.date).toISOString().split("T")[0] === formattedDate &&
        f.pigeon === pigeon
    );

    if (existingFlightIndex !== -1) {
      // ✅ Update existing flight entry
      participant.flightData[existingFlightIndex].startTime = null;
      participant.flightData[existingFlightIndex].endTime = null;
      participant.flightData[existingFlightIndex].flightTime = null; // Use null instead of "loft"
      participant.flightData[existingFlightIndex].lofted = true; // ✅ Mark as lofted
    } else {
      // ✅ Create a new lofted flight entry
      participant.flightData.push({
        date,
        pigeon,
        startTime: null,
        endTime: null,
        flightTime: null,
        lofted: true, // ✅ Lofted status
      });
    }

    await participant.save();
    res.json({ message: "Pigeon marked as lofted successfully" });
  } catch (error) {
    console.error("Error lofting pigeon:", error);
    res.status(500).json({ message: "Error lofting pigeon" });
  }
});

// Define Schema & Model
const postSchema = new mongoose.Schema({
  name: String,
  imageUrl: String,
});
const Post = mongoose.model("Post", postSchema);

// Upload a Post
app.post("/api/posts", upload.single("image"), async (req, res) => {
  try {
    const { name } = req.body;
    const imageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : "";

    const newPost = new Post({ name, imageUrl });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Posts
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a Post
app.delete("/api/posts/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
