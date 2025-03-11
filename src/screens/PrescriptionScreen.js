import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";

const PrescriptionScreen = ({ setPrescriptionData, prescriptionData }) => {
  const [validationResults, setValidationResults] = useState({});
  const [medicine, setMedicine] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // console.log("Received prescriptionData:", prescriptionData);

  let parsedData = [];

  // Parse and validate prescription data
  try {
    if (prescriptionData) {
      if (typeof prescriptionData === "string") {
        if (
          prescriptionData.trim().startsWith("[") ||
          prescriptionData.trim().startsWith("{")
        ) {
          parsedData = JSON.parse(prescriptionData.trim());
        } else {
          throw new Error("Data is not in JSON format.");
        }
      } else {
        parsedData = prescriptionData;
      }

      if (!Array.isArray(parsedData)) {
        throw new Error("Expected an array but received something else.");
      }
    }
  } catch (error) {
    console.error(
      "Invalid prescription data format:",
      error,
      "Received:",
      prescriptionData
    );
  }

  useEffect(() => {
    let parsedDataTemp = [];

    try {
      if (prescriptionData) {
        if (typeof prescriptionData === "string") {
          if (
            prescriptionData.trim().startsWith("[") ||
            prescriptionData.trim().startsWith("{")
          ) {
            parsedDataTemp = JSON.parse(prescriptionData.trim());
          } else {
            throw new Error("Data is not in JSON format.");
          }
        } else {
          parsedDataTemp = prescriptionData;
        }

        if (!Array.isArray(parsedDataTemp)) {
          throw new Error("Expected an array but received something else.");
        }
      }
    } catch (error) {
      console.error(
        "Invalid prescription data format:",
        error,
        "Received:",
        prescriptionData
      );
    }

    if (parsedDataTemp.length > 0) {
      setLoading(true);

      const validatePrescriptionsInBatches = async () => {
        const batchSize = 5;
        for (let i = 0; i < parsedDataTemp.length; i += batchSize) {
          const batch = parsedDataTemp.slice(i, i + batchSize);
          await Promise.all(
            batch.map((prescription, index) =>
              checkMedicine(
                prescription.medicine,
                prescription.disease,
                i + index
              )
            )
          );
        }
        setLoading(false);
      };

      validatePrescriptionsInBatches();
    }
  }, [prescriptionData]);

  const checkMedicine = async (medicine, disease, index) => {
    if (!medicine || !disease) return;

    try {
      const response = await axios.post(
        "http://localhost:5001/check-medicine",
        { medicine, disease }
      );
      setValidationResults((prev) => ({
        ...prev,
        [index]: response.data.message,
      }));
    } catch (error) {
      console.error("Error checking medicine:", error);
      setValidationResults((prev) => ({
        ...prev,
        [index]: "Error checking medicine.",
      }));
    }
  };

  // Render fallback UI if parsed data is invalid or empty
  if (!prescriptionData || !parsedData.length) {
    return (
      <Container>
        <h2>Prescription Details</h2>
        <p>No valid prescription data available.</p>
        <BackButton onClick={() => navigate("/")}>Go Back</BackButton>
      </Container>
    );
  }

  return (
    <Container>
      <h2>Prescription Details</h2>
      <Table>
        <thead>
          <tr>
            <th>Doctor</th>
            <th>Medicine</th>
            <th>Quantity</th>
            <th>Days</th>
            <th>Disease</th>
            <th>Validation</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6">Validating prescriptions...</td>
            </tr>
          ) : (
            parsedData.map((prescription, index) => (
              <tr key={index}>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const updatedPrescriptions = [...parsedData];
                    updatedPrescriptions[index].doctor = e.target.innerText;
                    setPrescriptionData(updatedPrescriptions);
                  }}
                >
                  {prescription.doctor || "N/A"}
                </td>

                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const updatedPrescriptions = [...parsedData];
                    updatedPrescriptions[index].medicine = e.target.innerText;
                    setPrescriptionData(updatedPrescriptions);
                    setMedicine(e.target.innerText);
                    checkMedicine(
                      e.target.innerText,
                      prescription.disease,
                      index
                    );
                  }}
                >
                  {prescription.medicine || "N/A"}
                </td>

                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const updatedPrescriptions = [...parsedData];
                    updatedPrescriptions[index].quantity = e.target.innerText;
                    setPrescriptionData(updatedPrescriptions);
                  }}
                >
                  {prescription.quantity || "N/A"}
                </td>

                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const updatedPrescriptions = [...parsedData];
                    updatedPrescriptions[index].days = e.target.innerText;
                    setPrescriptionData(updatedPrescriptions);
                  }}
                >
                  {prescription.days || "N/A"}
                </td>

                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const updatedPrescriptions = [...parsedData];
                    updatedPrescriptions[index].disease = e.target.innerText;
                    setPrescriptionData(updatedPrescriptions);
                    checkMedicine(
                      prescription.medicine,
                      e.target.innerText,
                      index
                    );
                  }}
                >
                  {prescription.disease || "N/A"}
                </td>

                <td>
                  <p>{validationResults[index]}</p>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      <BackButton onClick={() => navigate("/")}>Go Back</BackButton>
      <PrimaryButton onClick={() => navigate("/stock")}>
        Proceed to Stock
      </PrimaryButton>
    </Container>
  );
};

export default PrescriptionScreen;

// Styled Components
const Container = styled.div`
  text-align: center;
  padding: 20px;
`;

const Table = styled.table`
  width: 80%;
  margin: auto;
  border-collapse: collapse;
  margin-top: 20px;
  border: 1px solid #ddd;

  th,
  td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: center;
  }

  th {
    background-color: #4caf50;
    color: white;
  }
`;

const BackButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;

  &:hover {
    background-color: #0056b3;
  }
`;

const PrimaryButton = styled.button`
  padding: 8px 12px;

  background-color: #28a745;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #218838;
  }
`;
