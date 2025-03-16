import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";


const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  background-color: #e3f2fd;
  padding: 40px 20px;
`;

const Title = styled.h2`
  color: #1565c0;
  margin-bottom: 20px;
  font-size: 2.5rem;
  font-weight: bold;
`;

const Table = styled.table`
  width: 90%;
  max-width: 900px;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  th, td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: center;
    font-size: 16px;
  }

  th {
    background-color: #1976d2;
    color: white;
  }
`;

const ButtonContainer = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 20px;
`;

const Button = styled.button`
  background-color: ${props => (props.primary ? '#1976d2' : '#64b5f6')};
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: ${props => (props.primary ? '#1565c0' : '#42a5f5')};
    box-shadow: 6px 6px 14px rgba(0, 0, 0, 0.3);
  }
`;

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
        <Button onClick={() => navigate("/")}>Go Back</Button>

      </Container>
    );
  }

  return (
    <Container>
      <Title>Prescription Details</Title>
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
                <td contentEditable suppressContentEditableWarning onBlur={(e) => {
                    const updatedPrescriptions = [...parsedData];
                    updatedPrescriptions[index].doctor = e.target.innerText;
                    setPrescriptionData(updatedPrescriptions);
                  }}>
                  {prescription.doctor || "N/A"}
                </td>

                <td contentEditable suppressContentEditableWarning onBlur={(e) => {
                    const updatedPrescriptions = [...parsedData];
                    updatedPrescriptions[index].medicine = e.target.innerText;
                    setPrescriptionData(updatedPrescriptions);
                    checkMedicine(e.target.innerText, prescription.disease, index);
                  }}>
                  {prescription.medicine || "N/A"}
                </td>

                <td contentEditable suppressContentEditableWarning onBlur={(e) => {
                    const updatedPrescriptions = [...parsedData];
                    updatedPrescriptions[index].quantity = e.target.innerText;
                    setPrescriptionData(updatedPrescriptions);
                  }}>
                  {prescription.quantity || "N/A"}
                </td>

                <td contentEditable suppressContentEditableWarning onBlur={(e) => {
                    const updatedPrescriptions = [...parsedData];
                    updatedPrescriptions[index].days = e.target.innerText;
                    setPrescriptionData(updatedPrescriptions);
                  }}>
                  {prescription.days || "N/A"}
                </td>

                <td contentEditable suppressContentEditableWarning onBlur={(e) => {
                    const updatedPrescriptions = [...parsedData];
                    updatedPrescriptions[index].disease = e.target.innerText;
                    setPrescriptionData(updatedPrescriptions);
                    checkMedicine(prescription.medicine, e.target.innerText, index);
                  }}>
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
      <ButtonContainer>
        <Button onClick={() => navigate('/')}>Go Back</Button>
        <Button primary onClick={() => navigate('/stock')}>Proceed to Stock</Button>
      </ButtonContainer>
    </Container>
  );
};

export default PrescriptionScreen;

