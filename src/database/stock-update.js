const sqlite3 = require("sqlite3").verbose();

// ✅ Connect to SQLite database
const db = new sqlite3.Database("./stock.db", (err) => {
    if (err) {
        console.error("❌ Error connecting to database:", err.message);
    } else {
        console.log("✅ Connected to stock.db (Stock Database)");
    }
});

// ✅ Create stock table if it does not exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS stock (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            medicine TEXT NOT NULL,
            available INTEGER NOT NULL,
            cost INTEGER NOT NULL
        )
    `);

    // ✅ Check if table is empty and insert default stock
    db.get("SELECT COUNT(*) AS count FROM stock", (err, row) => {
        if (err) {
            console.error("❌ Error checking stock table:", err.message);
            return;
        }
        if (row.count === 0) {
            console.log("📝 Inserting sample stock data...");
            const stmt = db.prepare("INSERT INTO stock (medicine, available, cost) VALUES (?, ?, ?)");

            const stockData = [
                ["Paracetamol", 100, 20],
                ["Ibuprofen", 80, 30],
                ["Montex", 50, 40],
                ["Cough Syrup", 60, 50],
                ["Vitamin C", 120, 60]
            ];

            stockData.forEach(([medicine, available, cost]) => {
                stmt.run(medicine, available, cost);
            });

            stmt.finalize();
        }
    });
});

// ✅ Function to get stock details
const getStock = (callback) => {
    db.all("SELECT * FROM stock", (err, rows) => {
        if (err) {
            console.error("❌ Error retrieving stock data:", err.message);
            return callback(err, null);
        }
        callback(null, rows);
    });
};

// ✅ Function to update stock
const updateStock = (stockData, callback) => {
    const stmt = db.prepare("UPDATE stock SET available = ? WHERE medicine = ?");
    stockData.forEach(({ medicine, available, cost }) => {
        stmt.run(available, medicine, cost);
    });
    stmt.finalize(callback(null, { message: "Stock updated successfully!" }));
};

// ✅ Function to check stock availability
const checkStock = (medicine, requiredTablets, callback) => {
    db.get("SELECT available FROM stock WHERE LOWER(medicine) = LOWER(?)", [medicine], (err, row) => {
        if (err) {
            console.error("❌ Error checking stock:", err.message);
            return callback(err, null);
        }
        callback(null, { available: row ? row.available : 0 });
    });
};

// ✅ Function to deduct stock for billing
const deductStock = (medicine, quantity, callback) => {
    db.run("UPDATE stock SET available = available - ? WHERE medicine = ?", [quantity, medicine], (err) => {
        if (err) {
            console.error("❌ Error deducting stock:", err.message);
            return callback(err, null);
        }
        callback(null, { message: "Stock deducted successfully!" });
    });
};

// ✅ Export functions for use in Express routes
module.exports = {
    getStock,
    updateStock,
    checkStock,
    deductStock,
};
