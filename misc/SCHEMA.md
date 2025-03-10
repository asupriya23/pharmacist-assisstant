# Pharmacy Prescription Processing Database Schema

This document describes the database schema for the pharmacy prescription processing and management system. The system covers prescription scanning, medicine verification, stock management, billing, and monthly sales tracking.

---

## Tables and Relationships

### 1. `Doctors` Table
Stores details of doctors.

| Column Name     | Data Type      | Description                      |
|-----------------|----------------|-----------------------------------|
| `doctor_id`     | INT (PK)        | Unique identifier for the doctor  |
| `doctor_name`   | VARCHAR(255)    | Name of the doctor                |
| `tie_up_status` | BOOLEAN         | Indicates if doctor has tie-up    |
| `contact_info`  | VARCHAR(255)    | Contact information               |

---

### 2. `Patients` Table
Stores details of patients (keeps them anonymous).

| Column Name     | Data Type      | Description                      |
|-----------------|----------------|-----------------------------------|
| `patient_id`    | INT (PK)        | Unique identifier for the patient |
| `age`           | INT             | Patient’s age                     |
| `gender`        | VARCHAR(50)     | Patient’s gender                  |
| `contact_info`  | VARCHAR(255)    | Contact information               |

---

### 3. `Prescriptions` Table
Stores prescription details, linked to doctors and patients.

| Column Name       | Data Type      | Description                      |
|-------------------|----------------|-----------------------------------|
| `prescription_id` | INT (PK)        | Unique identifier for the prescription |
| `doctor_id`       | INT (FK)        | Linked to `Doctors`               |
| `patient_id`      | INT (FK)        | Linked to `Patients`              |
| `disease_name`    | VARCHAR(255)    | Disease diagnosed                 |
| `prescription_date` | DATETIME      | Date of prescription              |

---

### 4. `Prescription_Medicines` Table
Stores medicines prescribed in each prescription.

| Column Name         | Data Type      | Description                      |
|---------------------|----------------|-----------------------------------|
| `prescription_id`   | INT (FK)        | Linked to `Prescriptions`         |
| `medicine_id`       | INT (FK)        | Linked to `Medicines`             |
| `dosage`            | VARCHAR(255)    | Dosage instructions              |
| `quantity`          | INT             | Quantity prescribed               |

---

### 5. `Medicines` Table
Stores details of medicines.

| Column Name      | Data Type      | Description                      |
|------------------|----------------|-----------------------------------|
| `medicine_id`    | INT (PK)        | Unique identifier for the medicine |
| `medicine_name`  | VARCHAR(255)    | Name of the medicine              |
| `manufacturer`   | VARCHAR(255)    | Manufacturer’s name               |
| `price`          | DECIMAL(10, 2)  | Price per unit                    |

---

### 6. `Pharmacy_Stock` Table
Tracks medicine stock in the pharmacy.

| Column Name      | Data Type      | Description                      |
|------------------|----------------|-----------------------------------|
| `medicine_id`    | INT (FK)        | Linked to `Medicines`             |
| `stock_quantity` | INT             | Quantity available in stock       |
| `expiry_date`    | DATE            | Expiry date of the stock          |

---

### 7. `Pharmacy_Vendor` Table
Stores details of vendors for ordering medicines.

| Column Name      | Data Type      | Description                      |
|------------------|----------------|-----------------------------------|
| `vendor_id`      | INT (PK)        | Unique identifier for the vendor  |
| `vendor_name`    | VARCHAR(255)    | Name of the vendor                |
| `contact_info`   | VARCHAR(255)    | Contact information               |

---

### 8. `Billing` Table
Stores billing and discount details.

| Column Name        | Data Type      | Description                      |
|--------------------|----------------|-----------------------------------|
| `billing_id`       | INT (PK)        | Unique identifier for the billing |
| `prescription_id`  | INT (FK)        | Linked to `Prescriptions`         |
| `total_amount`     | DECIMAL(10, 2)  | Total amount billed               |
| `discount_applied` | BOOLEAN         | Indicates if a discount was applied |
| `final_amount`     | DECIMAL(10, 2)  | Amount after discount (if any)    |

---

### 9. `Medicine_Sales` Table
Tracks monthly sales of medicines for forecasting.

| Column Name      | Data Type      | Description                      |
|------------------|----------------|-----------------------------------|
| `sales_id`       | INT (PK)        | Unique identifier for sales record|
| `medicine_id`    | INT (FK)        | Linked to `Medicines`             |
| `sale_date`      | DATE            | Date of sale                      |
| `quantity_sold`  | INT             | Quantity sold                     |

---

### 10. `Disease_Mapping` Table
Maps diseases to recommended medicines for verification purposes.

| Column Name      | Data Type      | Description                      |
|------------------|----------------|-----------------------------------|
| `disease_name`   | VARCHAR(255)    | Name of the disease               |
| `medicine_id`    | INT (FK)        | Linked to `Medicines`             |

---

## Usage Overview
- **Prescription Scanning & Recognition**: Extracts doctor’s name, disease, prescribed medicines, and dosage instructions.
- **Verification & Accuracy Check**: Verifies if medicines are correctly matched to diagnosed diseases.
- **Stock Availability**: Checks and processes medicine availability or orders from vendors.
- **Billing**: Applies discounts for tie-ups and generates the final bill.
- **Monthly Tracking**: Analyzes sales data for forecasting and identifying seasonal disease trends.