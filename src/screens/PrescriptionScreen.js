import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";

const PrescriptionScreen = ({ prescriptionData }) => {
  const [validationResults, setValidationResults] = useState({});
  const [medicine, setMedicine] = useState("");
  const navigate = useNavigate();

  console.log("Received prescriptionData:", prescriptionData);

  // Fix: Ensure prescriptionData is valid before parsing
  if (!prescriptionData) {
    console.error("Error: prescriptionData is null or undefined.");
    return (
      <Container>
        <h2>Prescription Details</h2>
        <p>No valid prescription data available.</p>
        <BackButton onClick={() => navigate("/")}>Go Back</BackButton>
      </Container>
    );
  }

  let parsedData;

  try {
    if (typeof prescriptionData === "string") {
      // Check if it starts with a valid JSON format (like '[' or '{')
      if (prescriptionData.trim().startsWith("[") || prescriptionData.trim().startsWith("{")) {
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
  } catch (error) {
    console.error("Invalid prescription data format:", error, "Received:", prescriptionData);
    return (
      <Container>
        <h2>Prescription Details</h2>
        <p>No valid prescription data available.</p>
        <BackButton onClick={() => navigate("/")}>Go Back</BackButton>
      </Container>
    );
  }
  const checkMedicine = async (medicine, disease, index) => {
    try {
      const response = await axios.post("http://localhost:5001/check-medicine", {
        medicine,
        disease,
      });
      console.log("check response", response);
      setValidationResults((prev) => ({ ...prev, [index]: response.data.message }));
    } catch (error) {
      console.error("Error checking medicine:", error);
      setValidationResults((prev) => ({ ...prev, [index]: "Error checking medicine." }));
    }
  };
  //const requiredTablets = qunantity*days;
  //its a fucntion having these props
  //curly be=races are used to declare dict
  // setStockData({
  //   "medicine": prescriptionData.medicine,
  //   "qunantity":prescriptionData.quantity,
  //   "data": prescriptionData.days,
  //   "doctor":prescriptionData.doctor})
  
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
        {parsedData.map((prescription, index) => (
          <tr key={index}>
<td
  contentEditable
  suppressContentEditableWarning
  onBlur={(e) => {
    const updatedPrescriptions = [...parsedData];
    updatedPrescriptions[index].doctor = e.target.innerText;
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
  }}
>
  {prescription.disease || "N/A"}
</td>

            <td>
              <p>{validationResults[index]}</p>
            </td>
          </tr>
        ))}
        </tbody>
      </Table>
      <BackButton onClick={() => navigate("/")}>Go Back</BackButton>
      <button onClick={() => navigate("/stock")}>Proceed to Stock</button>

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

  th, td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: center;
  }

  th {
    background-color: #4CAF50;
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
