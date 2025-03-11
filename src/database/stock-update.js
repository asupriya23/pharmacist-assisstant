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
                ["Aspirin", 70, 25],
                ["Amoxicillin", 90, 35],
                ["Cetirizine", 60, 15],
                ["Metformin", 100, 50],
                ["Losartan", 75, 45],
                ["Omeprazole", 85, 40],
                ["Salbutamol", 70, 30],
                ["Azithromycin", 100, 60],
                ["Dolo-650", 80, 20],
                ["Diclofenac", 60, 25],
                ["Loratadine", 70, 20],
                ["Ranitidine", 90, 30],
                ["Pantoprazole", 85, 40],
                ["Levocetirizine", 60, 25],
                ["Dexamethasone", 70, 35],
                ["Amlodipine", 80, 40],
                ["Ciprofloxacin", 75, 55],
                ["Atorvastatin", 85, 50],
                ["Clarithromycin", 70, 60],
                ["Prednisolone", 80, 45],
                ["Fluconazole", 100, 30],
                ["Ondansetron", 70, 35],
                ["Montelukast", 90, 40],
                ["Esomeprazole", 75, 45],
                ["Methotrexate", 50, 65],
                ["Rosuvastatin", 80, 50],
                ["Budesonide", 60, 30],
                ["Fexofenadine", 70, 35],
                ["Rivaroxaban", 60, 75],
                ["Warfarin", 90, 45],
                ["Doxycycline", 70, 40],
                ["Mupirocin", 80, 25],
                ["Alendronate", 50, 55],
                ["Clopidogrel", 75, 35],
                ["Hydrochlorothiazide", 70, 40],
                ["Spironolactone", 60, 50],
                ["Tamsulosin", 70, 30],
                ["Carvedilol", 85, 45],
                ["Lisinopril", 100, 40],
                ["Simvastatin", 75, 50],
                ["Gabapentin", 60, 60],
                ["Pregabalin", 50, 70],
                ["Lamotrigine", 80, 55],
                ["Topiramate", 70, 65],
                ["Risperidone", 75, 40],
                ["Sertraline", 90, 50],
                ["Fluoxetine", 100, 60],
                ["Duloxetine", 75, 55],
                ["Venlafaxine", 60, 50],
                ["Bupropion", 70, 70],
                ["Mirtazapine", 80, 40],
                ["Olanzapine", 75, 60],
                ["Quetiapine", 60, 70],
                ["Haloperidol", 80, 45],
                ["Diazepam", 90, 30],
                ["Alprazolam", 70, 35],
                ["Clonazepam", 80, 50],
                ["Lorazepam", 60, 45],
                ["Zolpidem", 70, 40],
                ["Modafinil", 75, 80],
                ["Melatonin", 100, 20],
                ["Bisoprolol", 70, 55],
                ["Varenicline", 60, 70],
                ["Sitagliptin", 80, 60],
                ["Glipizide", 90, 40],
                ["Canagliflozin", 75, 70],
                ["Empagliflozin", 70, 60],
                ["Pioglitazone", 80, 50],
                ["Ipill", 0, 120]
            ]
            

            stockData.forEach(([medicine, available, cost]) => {
                stmt.run(medicine, available, cost);
            });

            stmt.finalize();
        }
    });
    // ✅ Print all records after insertion
    db.all("SELECT * FROM stock", (err, rows) => {
        if (err) {
            console.error("❌ Error retrieving data:", err.message);
            return;
        }
        console.log("📋 Stock Table:");
        console.table(rows);
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

const updateStock = (stockData, callback) => {
  const stmt = db.prepare("UPDATE stock SET available = ? WHERE medicine = ?");
  let errorOccurred = false;

  stockData.forEach(({ medicine, available }) => {
    stmt.run(available, medicine, (err) => {
      if (err) {
        console.error("❌ Error updating stock:", err.message);
        errorOccurred = true;
      }
    });
  });

  stmt.finalize((err) => {
    if (err || errorOccurred) {
      return callback(err || new Error("Some updates failed"), null);
    }
    callback(null, { message: "Stock updated successfully!" });
  });
};


// ✅ Function to check stock availability
const checkStock = (medicine, requiredTablets, callback) => {
    db.get("SELECT * FROM stock WHERE LOWER(medicine) = LOWER(?)", [medicine], (err, row) => {
        if (err) {
            console.error("❌ Error checking stock:", err.message);
            return callback(err, null);
        }
        callback(null, row);
    });
};

// ✅ Function to deduct stock for billing
const deductStock = (medicine, quantity, callback) => {
    console.log("deduct", medicine, quantity);
    db.run("UPDATE stock SET available = available - ? WHERE LOWER(medicine) = LOWER(?)", [quantity, medicine], (err) => {
        if (err) {
            console.error("❌ Error deducting stock:", err.message);
            return callback(err, null);
        }
        callback(null, { message: "Stock deducted successfully!" });
    });
};

const addStock = (medicine, available, cost, callback) => {
    db.run("INSERT INTO stock (medicine, available, cost) VALUES (?, ?, ?)", 
    [medicine, available, cost], function(err) {
        if (err) {
            console.error("❌ Error adding stock:", err.message);
            return callback(err, null);
        }
        console.log(`Stock added with ID: ${this.lastID}`);
        callback(null, { id: this.lastID, medicine, available, cost });
    });
};

// ✅ Export functions for use in Express routes
module.exports = {
    getStock,
    updateStock,
    checkStock,
    deductStock,
    addStock,
};
