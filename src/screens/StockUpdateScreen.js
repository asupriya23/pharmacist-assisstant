import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
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
  font-size: 3rem;
  font-weight: bold;
`;

const Section = styled.div`
  width: 100%;
  max-width: 650px;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const Button = styled.button`
  background-color: ${props => (props.primary ? '#1976d2' : '#64b5f6')};
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  margin: 15px;
  transition: all 0.3s ease;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.2);
  width: 230px;
  text-align: center;

  &:hover {
    background-color: ${props => (props.primary ? '#1565c0' : '#42a5f5')};
    box-shadow: 6px 6px 14px rgba(0, 0, 0, 0.3);
  }
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;

  label {
    font-size: 16px;
    font-weight: bold;
    color: #1565c0;
  }

  input {
    padding: 10px;
    border: 1px solid #90caf9;
    border-radius: 6px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Message = styled.div`
  margin-top: 15px;
  padding: 10px;
  border-radius: 8px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
`;

const StockUpdateScreen = () => {
  const navigate = useNavigate();
  const [medicineName, setMedicineName] = useState("");
  const [stockDetails, setStockDetails] = useState(null);
  const [newStock, setNewStock] = useState("");
  const [message, setMessage] = useState("");
  const [expectedCost, setExpectedCost] = useState(0);

  const [newMedicineName, setNewMedicineName] = useState("");
  const [diseaseName, setDiseaseName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [addMessage, setAddMessage] = useState("");

  // Function to fetch stock details
  const fetchStockDetails = async () => {
    try {
      const response = await axios.post("http://localhost:5001/check-stock", {
        medicine: medicineName,
      });
      setStockDetails(response.data); // Assuming API returns { medicine, available, cost }
      setMessage("");
      if (response.data.length === 0) {
        setMessage("Medicine not in Database");
      }
    } catch (error) {
      console.error("Error fetching stock details:", error.message);
      setMessage("Error fetching stock details. Please try again.");
    }
  };

  // Function to update stock
  const handleUpdateStock = async () => {
    if (!newStock) {
      setMessage("Please enter a valid stock value.");
      return;
    }

    try {
      await axios.post("http://localhost:5001/update-stock", [
        { medicine: medicineName, available: parseInt(newStock) },
      ]);
      setMessage("Stock updated successfully!");
      fetchStockDetails(); // Refresh the stock details
    } catch (error) {
      console.error("Error updating stock:", error.message);
      setMessage("Error updating stock. Please try again.");
    }
  };

  // Function to add new medicine
  const handleAddMedicine = async (e) => {
    e.preventDefault();
    
    if (!newMedicineName || !diseaseName || !quantity || !price) {
      setAddMessage("Please fill all fields");
      return;
    }

    try {
      // First add to medicine database
      await axios.post("http://localhost:5001/add-medicine", {
        medicine: newMedicineName,
        disease: diseaseName
      });
      
      // Then add to stock database
      await axios.post("http://localhost:5001/add-stock", {
        medicine: newMedicineName,
        available: parseInt(quantity),
        cost: parseFloat(price)
      });
      
      setAddMessage("Medicine added successfully!");
      
      // Clear form
      setNewMedicineName("");
      setDiseaseName("");
      setQuantity("");
      setPrice("");
      
    } catch (error) {
      console.error("Error adding medicine:", error.message);
      setAddMessage("Error adding medicine. Please try again.");
    }
  };


  return (
    <Container>
      <Title>Stock Update</Title>
      <Button onClick={() => navigate('/')}>Back</Button>

      <Section>
        <h3>Check & Update Existing Stock</h3>
        <InputContainer>
          <label htmlFor="medicine">Medicine Name:</label>
          <input
            type="text"
            id="medicine"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
            placeholder="Enter medicine name"
          />
          <Button onClick={fetchStockDetails}>Fetch Stock</Button>
        </InputContainer>

        {stockDetails && (
          <div>
            <p><strong>Medicine:</strong> {stockDetails.medicine}</p>
            <p><strong>Available Stock:</strong> {stockDetails.available}</p>
            <p><strong>Cost:</strong> Rs. {stockDetails.cost}</p>
            <InputContainer>
              <label htmlFor="new-stock">New Stock:</label>
              <input
                type="number"
                id="new-stock"
                value={newStock}
                onChange={(e) => {
                  setNewStock(e.target.value);
                  setExpectedCost(stockDetails.cost * (e.target.value - stockDetails.available));
                }}
                placeholder="Enter new stock quantity"
              />
              <p><strong>Expected Cost / Loss:</strong> Rs. {expectedCost}</p>
              <Button onClick={handleUpdateStock}>Update Stock</Button>
            </InputContainer>
          </div>
        )}
        {message && <Message>{message}</Message>}
      </Section>

      <Section>
        <h3>Add New Medicine</h3>
        <Form onSubmit={handleAddMedicine}>
          <InputContainer>
            <label htmlFor="new-medicine">Medicine Name:</label>
            <input
              type="text"
              id="new-medicine"
              value={newMedicineName}
              onChange={(e) => setNewMedicineName(e.target.value)}
              placeholder="Enter medicine name"
              required
            />
          </InputContainer>
          <InputContainer>
            <label htmlFor="disease">Disease Name:</label>
            <input
              type="text"
              id="disease"
              value={diseaseName}
              onChange={(e) => setDiseaseName(e.target.value)}
              placeholder="Enter disease name"
              required
            />
          </InputContainer>
          <InputContainer>
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              required
            />
          </InputContainer>
          <InputContainer>
            <label htmlFor="price">Price (Rs.):</label>
            <input
              type="number"
              step="0.01"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              required
            />
          </InputContainer>
          <Button primary type="submit">Add Medicine</Button>
        </Form>
        {addMessage && <Message>{addMessage}</Message>}
      </Section>
    </Container>
  );
};

export default StockUpdateScreen;

