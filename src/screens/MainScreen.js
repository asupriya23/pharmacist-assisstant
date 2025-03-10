import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  text-align: center;
  padding: 30px;
  background-color: #f4f4f9;
  min-height: 100vh;
  font-family: Arial, sans-serif;
`;

const Title = styled.h1`
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 20px;
`;

const UploadLabel = styled.label`
  display: block;
  font-size: 18px;
  margin-bottom: 10px;
  cursor: pointer;
  color: #3498db;
`;

const FileInput = styled.input`
  display: none;
`;

const Button = styled.button`
  background-color: ${(props) => (props.primary ? "#3498db" : "#2ecc71")};
  color: white;
  font-size: 16px;
  padding: 10px 20px;
  margin: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.primary ? "#2980b9" : "#27ae60")};
  }
`;

const TextOutput = styled.pre`
  background: #ecf0f1;
  padding: 15px;
  border-radius: 5px;
  text-align: left;
  margin-top: 20px;
  white-space: pre-wrap;
`;

function MainScreen({ onGeneratePrescription }) {  // ✅ Receive the prop

  const [image, setImage] = useState(null);
  const [recognizedText, setRecognizedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [formattedPrescription, setFormattedPrescription] = useState("Fetching prescription...");
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState("");
  const apiKey = "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"; // Replace with your actual API key
//upload image
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setRecognizedText(""); // Reset text when new image is uploaded
    setFormattedPrescription("Fetching prescription..."); // Reset prescription output
  };
//navigation to prescription screen
  const handleClick = () => {
    onGeneratePrescription(prescription); // Pass the JSON object directly
    navigate("/prescription");
  };
//ocr pocessing and receiving recognised text
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("response:",response);
      setRecognizedText(response.data.transcription);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error processing the image.");
    }

    setLoading(false);
  };
// send the recieved text to llm and update formated prescription and pescription
  useEffect(() => {
    async function getFormattedPrescription() {
      if (!recognizedText) return;

      const prompt = `Extract the following prescription text into a structured JSON array with these fields:

                      doctor: The name of the prescribing physician
                      medicine: The name of each prescribed medication
                      quantity: The dosage or amount of each medication
                      days: The number of days medication is required
                      disease: The condition being treated
                      

                      IMPORTANT:
                      - Output ONLY the JSON array without any introductory text, explanations, or markdown formatting
                      - Do not include any special characters outside the JSON structure
                      - Ensure the JSON is properly formatted and valid
                      - If any field information is missing in the prescription, use null for that value
                      - If multiple medications are prescribed, create separate JSON objects for each one
                      - Here is the prescription text to extract:
                      - Give a PLAIN TEXT output (NO MARKDOWN)
                      ${recognizedText}
                      `;

      console.log(recognizedText);
      try {
        // const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        //   method: "POST",
        //   headers: {
        //     "Authorization": `Bearer ${apiKey}`,
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     model: "cognitivecomputations/dolphin3.0-mistral-24b:free",
        //     messages: [
        //       {
        //         role: "user",
        //         content: [{ type: "text", text: prompt }],
        //       },
        //     ],
        //   }),
        // });

        // const data = await response.json();
        // console.log("data:",data);

        // if (!data.choices || data.choices.length === 0) {
        //   throw new Error("Invalid API response: choices array is missing or empty.");
        // }

        
      const temp_text = `[ 
        { "doctor": "Amit Mishra", "medicine": "Montex", "quantity": null, "disease": "Cold and cough" },
        { "doctor": "Ajit Mishra", "medicine": "Paracetamol", "quantity": 3, "days": 5, "disease": "Fever" },
        { "doctor": "Shashibala Mishra", "medicine": "Ipill", "quantity": 1, "days": 5, "disease": "Abortion" }
      ]`;
      
        const jsonData = JSON.parse(temp_text);
        setFormattedPrescription(JSON.stringify(jsonData, null, 2));  // Ensure readable JSON string
        setPrescription(jsonData);  // Keep JSON for further use
      } catch (error) {
        console.error("Error parsing JSON:", error);
        setFormattedPrescription("Error formatting prescription.");
      }
    }

    getFormattedPrescription();
  }, [recognizedText]); // Runs only when `recognizedText` changes

  return (
    <Container>
      <Title>MediScan</Title>
      <form onSubmit={handleSubmit}>
        <UploadLabel>
          Choose a File
          <FileInput type="file" accept="image/*" onChange={handleImageChange} />
        </UploadLabel>
        <Button primary type="submit" disabled={loading}>
          {loading ? "Processing..." : "Upload & Recognize"}
        </Button>
      </form>

      {recognizedText && (
        <>
          <TextOutput>{formattedPrescription}</TextOutput>
          <Button onClick={handleClick}>
            Generate Prescription
          </Button>
        </>
      )}
    </Container>
  );
}

export default MainScreen;
