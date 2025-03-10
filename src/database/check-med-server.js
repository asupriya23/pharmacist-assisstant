const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./pharmacy.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error("❌ Error opening database:", err.message);
    } else {
        console.log("✅ Connected to pharmacy.db");
    }
});

const app = express();
app.use(cors({ origin: "http://localhost:3000", methods: ["GET", "POST"], credentials: true }));
app.use(bodyParser.json());

// ✅ Route to check if medicine matches disease
app.post("/check-medicine", (req, res) => {
    const { medicine, disease } = req.body; // ✅ Extract values from req.body

    if (!medicine || !disease) {
        console.error("❌ Invalid request data:", req.body);
        return res.status(400).json({ message: "Invalid request data" });
    }

    console.log("🔍 Checking Medicine:", medicine, "for Disease:", disease);

    db.get(
        "SELECT * FROM medicines WHERE LOWER(medicine) = LOWER(?) AND LOWER(disease) = LOWER(?)",
        [medicine.trim(), disease.trim()],
        (err, row) => {
            if (err) {
                console.error("❌ Database error:", err);
                return res.status(500).json({ error: "Database error", details: err.message });
            }

            if (row) {
                console.log("✅ Match Found:", row);
                res.json({ match: true, message: "✔ Medicine is correct for the disease!" });
            } else {
                console.log("❌ No Match Found");
                res.json({ match: false, message: "❌ Medicine does NOT match the disease! Please check again!" });
            }
        }
    );
});

// get stock data
const { getStock, updateStock, checkStock, deductStock } = require("./stock-update");

app.get("/get-stock", (req, res) => {
    getStock((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
//update stock
app.post("/update-stock", (req, res) => {
    const { stockData } = req.body;
    updateStock(stockData, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});
//check stock
app.post("/check-stock", (req, res) => {
    const { medicine, requiredTablets } = req.body;
    checkStock(medicine, requiredTablets, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});
//dedut stock
app.post("/deduct-stock", (req, res) => {
    const { medicine, quantity } = req.body;
    deductStock(medicine, quantity, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// ✅ Start the server
app.listen(5001, () => {
    console.log("✅ Server is running on port 5001");
});
