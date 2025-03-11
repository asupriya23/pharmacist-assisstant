import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

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
      <h2>Stock Update</h2>
      <PrimaryButton onClick={() => navigate("/")}>Back</PrimaryButton>

      <Section>
        <h3>Check & Update Existing Stock</h3>
        {/* Input for Medicine Name */}
        <InputContainer>
          <label htmlFor="medicine">Medicine Name:</label>
          <input
            type="text"
            id="medicine"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
            placeholder="Enter medicine name"
          />
          <button onClick={fetchStockDetails}>Fetch Stock</button>
        </InputContainer>

        {/* Display Stock Details */}
        {stockDetails && (
          <DetailsContainer>
            <p>
              <strong>Medicine:</strong> {stockDetails.medicine}
            </p>
            <p>
              <strong>Available Stock:</strong> {stockDetails.available}
            </p>
            <p>
              <strong>Cost:</strong> Rs. {stockDetails.cost}
            </p>

            <UpdateContainer>
              <label htmlFor="new-stock">New Stock:</label>
              <input
                type="number"
                id="new-stock"
                value={newStock}
                onChange={(e) => {
                  setNewStock(e.target.value);
                  setExpectedCost(
                    stockDetails.cost * (e.target.value - stockDetails.available)
                  );
                }}
                placeholder="Enter new stock quantity"
              />
              <p>
                <strong>Expected Cost / Loss:</strong> Rs. {expectedCost}
              </p>
              <button onClick={handleUpdateStock}>Update Stock</button>
            </UpdateContainer>
          </DetailsContainer>
        )}

        {/* Display Message */}
        {message && <Message>{message}</Message>}
      </Section>

      <Section>
        <h3>Add New Medicine</h3>
        <Form onSubmit={handleAddMedicine}>
          <FormGroup>
            <label htmlFor="new-medicine">Medicine Name:</label>
            <input
              type="text"
              id="new-medicine"
              value={newMedicineName}
              onChange={(e) => setNewMedicineName(e.target.value)}
              placeholder="Enter medicine name"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="disease">Disease Name:</label>
            <input
              type="text"
              id="disease"
              value={diseaseName}
              onChange={(e) => setDiseaseName(e.target.value)}
              placeholder="Enter disease name"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              required
            />
          </FormGroup>
          
          <FormGroup>
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
          </FormGroup>
          
          <SubmitButton type="submit">Add Medicine</SubmitButton>
        </Form>
        
        {/* Display Add Message */}
        {addMessage && <Message>{addMessage}</Message>}
      </Section>
    </Container>
  );
};

export default StockUpdateScreen;

// Styled components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Section = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
`;

const PrimaryButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
  
  &:hover {
    background-color: #45a049;
  }
`;

const InputContainer = styled.div`
  margin-bottom: 15px;
  
  label {
    display: block;
    margin-bottom: 5px;
  }
  
  input {
    padding: 8px;
    margin-right: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  button {
    padding: 8px 15px;
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background-color: #0b7dda;
    }
  }
`;

const DetailsContainer = styled.div`
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
`;

const UpdateContainer = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  
  label {
    display: block;
    margin-bottom: 5px;
  }
  
  input {
    padding: 8px;
    margin-right: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  button {
    padding: 8px 15px;
    background-color: #ff9800;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background-color: #e68a00;
    }
  }
`;

const Message = styled.div`
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  
  label {
    margin-bottom: 5px;
  }
  
  input {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
`;

const SubmitButton = styled.button`
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  
  &:hover {
    background-color: #45a049;
  }
`;
