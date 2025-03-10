const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./pharmacy.db", (err) => {
    if (err) {
        console.error("Error connecting to database:", err.message);
    } else {
        console.log("✅ Connected to the SQLite database.");
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS medicines (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            medicine TEXT NOT NULL, 
            disease TEXT NOT NULL
        )
    `);

    db.get("SELECT COUNT(*) AS count FROM medicines", (err, row) => {
        if (err) {
            console.error("❌ Error checking table:", err.message);
            return;
        }
        if (row.count === 0) {
            console.log("📝 Inserting sample data into medicines table...");
            const stmt = db.prepare("INSERT INTO medicines (medicine, disease) VALUES (?, ?)");

            const medicines = [
                ["Paracetamol", "Fever"],
                ["Ibuprofen", "Headache"],
                ["Montex", "Cold and Cough"],
                ["Aspirin", "Pain Relief"],
                ["Amoxicillin", "Bacterial Infection"],
                ["Cetirizine", "Allergy"],
                ["Metformin", "Diabetes"],
                ["Losartan", "High Blood Pressure"],
                ["Omeprazole", "Acid Reflux"],
                ["Salbutamol", "Asthma"],
                ["Azithromycin", "Bacterial Infection"],
                ["Dolo-650", "Fever"],
                ["Diclofenac", "Muscle Pain"],
                ["Loratadine", "Allergy"],
                ["Ranitidine", "Stomach Ulcer"],
                ["Pantoprazole", "Acid Reflux"],
                ["Levocetirizine", "Skin Allergy"],
                ["Dexamethasone", "Inflammation"],
                ["Amlodipine", "Hypertension"],
                ["Ciprofloxacin", "Urinary Tract Infection"],
                ["Atorvastatin", "Cholesterol"],
                ["Clarithromycin", "Pneumonia"],
                ["Prednisolone", "Arthritis"],
                ["Fluconazole", "Fungal Infection"],
                ["Ondansetron", "Nausea"],
                ["Montelukast", "Asthma"],
                ["Esomeprazole", "Gastritis"],
                ["Methotrexate", "Arthritis"],
                ["Rosuvastatin", "High Cholesterol"],
                ["Budesonide", "Bronchitis"],
                ["Fexofenadine", "Allergic Rhinitis"],
                ["Rivaroxaban", "Blood Clot Prevention"],
                ["Warfarin", "Blood Thinner"],
                ["Doxycycline", "Bacterial Infection"],
                ["Mupirocin", "Skin Infection"],
                ["Alendronate", "Osteoporosis"],
                ["Clopidogrel", "Heart Attack Prevention"],
                ["Hydrochlorothiazide", "High Blood Pressure"],
                ["Spironolactone", "Heart Failure"],
                ["Tamsulosin", "Prostate Enlargement"],
                ["Carvedilol", "Heart Failure"],
                ["Lisinopril", "High Blood Pressure"],
                ["Simvastatin", "High Cholesterol"],
                ["Gabapentin", "Nerve Pain"],
                ["Pregabalin", "Fibromyalgia"],
                ["Lamotrigine", "Epilepsy"],
                ["Topiramate", "Migraine Prevention"],
                ["Risperidone", "Schizophrenia"],
                ["Sertraline", "Depression"],
                ["Fluoxetine", "Depression"],
                ["Duloxetine", "Anxiety"],
                ["Venlafaxine", "Panic Disorder"],
                ["Bupropion", "Smoking Cessation"],
                ["Mirtazapine", "Insomnia"],
                ["Olanzapine", "Bipolar Disorder"],
                ["Quetiapine", "Schizophrenia"],
                ["Haloperidol", "Psychosis"],
                ["Diazepam", "Anxiety"],
                ["Alprazolam", "Panic Disorder"],
                ["Clonazepam", "Seizures"],
                ["Lorazepam", "Insomnia"],
                ["Zolpidem", "Sleep Disorder"],
                ["Modafinil", "Narcolepsy"],
                ["Melatonin", "Jet Lag"],
                ["Ranitidine", "Acid Reflux"],
                ["Bisoprolol", "Heart Disease"],
                ["Varenicline", "Smoking Cessation"],
                ["Sitagliptin", "Diabetes"],
                ["Glipizide", "Diabetes"],
                ["Canagliflozin", "Diabetes"],
                ["Empagliflozin", "Diabetes"],
                ["Pioglitazone", "Diabetes"],
                ["Levothyroxine", "Hypothyroidism"],
                ["Liothyronine", "Hypothyroidism"],
                ["Methimazole", "Hyperthyroidism"],
                ["Propylthiouracil", "Hyperthyroidism"],
                ["Hydrocortisone", "Adrenal Insufficiency"],
                ["Testosterone", "Hormone Deficiency"],
                ["Estradiol", "Menopause Symptoms"],
                ["Progesterone", "Hormone Replacement Therapy"],
                ["Tamoxifen", "Breast Cancer"],
                ["Anastrozole", "Breast Cancer"],
                ["Letrozole", "Breast Cancer"],
                ["Trastuzumab", "Breast Cancer"],
                ["Bevacizumab", "Cancer Treatment"],
                ["Rituximab", "Lymphoma"],
                ["Methotrexate", "Psoriasis"],
                ["Cyclosporine", "Organ Transplant Rejection"],
                ["Tacrolimus", "Organ Transplant Rejection"],
                ["Mycophenolate", "Organ Transplant Rejection"],
                ["Azathioprine", "Autoimmune Diseases"],
                ["Colchicine", "Gout"],
                ["Allopurinol", "Gout"],
                ["Febuxostat", "Gout"],
                ["Tadalafil", "Erectile Dysfunction"],
                ["Sildenafil", "Erectile Dysfunction"],
                ["Vardenafil", "Erectile Dysfunction"],
                ["Dapoxetine", "Premature Ejaculation"],
                ["Finasteride", "Hair Loss"],
                ["Minoxidil", "Hair Loss"],
                ["Isotretinoin", "Acne"],
                ["Adapalene", "Acne"],
                ["Clindamycin", "Acne"],
                ["Benzoyl Peroxide", "Acne"],
                ["Acyclovir", "Herpes"],
                ["Valacyclovir", "Herpes"],
                ["Famciclovir", "Herpes"],
                ["Oseltamivir", "Influenza"],
                ["Ribavirin", "Hepatitis C"],
                ["Sofosbuvir", "Hepatitis C"],
                ["Ledipasvir", "Hepatitis C"],
                ["Raltegravir", "HIV"],
                ["Efavirenz", "HIV"],
                ["Tenofovir", "HIV"],
                ["Abacavir", "HIV"],
                ["Dolutegravir", "HIV"],
                ["Lopinavir", "HIV"],
                ["Remdesivir", "COVID-19"],
                ["Molnupiravir", "COVID-19"],
                ["Paxlovid", "COVID-19"],
                ["Ivermectin", "Parasitic Infections"],
                ["Albendazole", "Worm Infections"],
                ["Mebendazole", "Pinworm"],
                ["Praziquantel", "Schistosomiasis"],
                ["Chloroquine", "Malaria"],
                ["Hydroxychloroquine", "Lupus"],
                ["Artemether", "Malaria"],
                ["Lumefantrine", "Malaria"],
                ["Dapsone", "Leprosy"],
                ["Clofazimine", "Leprosy"],
                ["Thalidomide", "Leprosy"],
                ["Bortezomib", "Multiple Myeloma"],
                ["Lenalidomide", "Multiple Myeloma"],
                ["Daratumumab", "Multiple Myeloma"],
                ["Cyclophosphamide", "Cancer"],
                ["Cisplatin", "Cancer"],
                ["Paclitaxel", "Cancer"],
                ["Etoposide", "Cancer"],
                ["Docetaxel", "Cancer"],
                ["Ifosfamide", "Cancer"],
                ["Vincristine", "Cancer"],
                ["Doxorubicin", "Cancer"],
                ["Tamoxifen", "Breast Cancer"],
                ["Everolimus", "Kidney Cancer"],
                ["Sorafenib", "Liver Cancer"],
                ["Imatinib", "Leukemia"],
                ["Dasatinib", "Leukemia"],
                ["Nilotinib", "Leukemia"]
            ];            

            medicines.forEach(([medicine, disease]) => {
                stmt.run(medicine, disease);
            });

            stmt.finalize();
        }
         
        // ✅ Print all records after insertion
        db.all("SELECT * FROM medicines", (err, rows) => {
            if (err) {
                console.error("❌ Error retrieving data:", err.message);
                return;
            }
            console.log("📋 Medicines Table:");
            console.table(rows);
        });
    });
});

// ✅ Export the database connection
module.exports = db;
