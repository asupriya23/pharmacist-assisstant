import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  background-color: #e3f2fd; /* Light blue medical theme */
  padding-top: 80px; /* Shift content to upper half */
  position: relative;
`;

const Navbar = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
`;

const Dropdown = styled.div`
  position: relative;
  display: inline-block;
  cursor: pointer;
`;

const DropdownText = styled.span`
  font-size: 18px;
  color:rgb(0, 4, 8);
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const DropdownContent = styled.div`
  display: ${props => (props.show ? 'block' : 'none')};
  position: absolute;
  background-color: #ffffff;
  min-width: 250px;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.1);
  padding: 15px;
  border-radius: 5px;
  z-index: 1;
  top: 25px;
  font-size: 14px;
  line-height: 1.5;
`;

const Title = styled.h1`
  color: #1565c0;
  margin-bottom: 20px;
  font-size: 4rem; /* Increase size */
  font-weight: bold;
  margin-top: 20px; /* Ensure spacing above dropdowns */
`;

const UploadLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid #90caf9;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
  width: 260px;
  text-align: center;

  &:hover {
    background-color: #bbdefb;
  }
`;

const FileInput = styled.input`
  display: none;
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

  &:disabled {
    background-color: #b0bec5;
    cursor: not-allowed;
  }
`;

const TextOutput = styled.div`
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.1);
  margin: 25px 0;
  max-width: 650px;
  text-align: center;
`;



function MainScreen({ setPrescriptionData }) {
  // ✅ Receive the prop
  const [dropdown, setDropdown] = useState(null);
  const [image, setImage] = useState(null);
  const [recognizedText, setRecognizedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [formattedPrescription, setFormattedPrescription] = useState(
    "Fetching prescription..."
  );
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState("");
  const apiKey =
    "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"; // Replace with your actual API key
  //upload image
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setRecognizedText(""); // Reset text when new image is uploaded
    setFormattedPrescription("Fetching prescription..."); // Reset prescription output
  };
  //navigation to prescription screen
  const handleClick = () => {
    setPrescriptionData(prescription); // Pass the JSON object directly
    navigate("/prescription");
  };

  const handleClickStockUpdate = () => {
    navigate("/update");
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
      const response = await axios.post(
        "http://127.0.0.1:5000/predict",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

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
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "cognitivecomputations/dolphin3.0-mistral-24b:free",
              messages: [
                {
                  role: "user",
                  content: [{ type: "text", text: prompt }],
                },
              ],
            }),
          }
        );

        const data = await response.json();
        console.log("data:", data);

        if (!data.choices || data.choices.length === 0) {
          throw new Error(
            "Invalid API response: choices array is missing or empty."
          );
        }

        // const temp_text = `[
        //   { "doctor": "Amit Mishra", "medicine": "Montex", "quantity": 4, "days": 3, "disease": "Cold and cough" },
        //   { "doctor": "Ajit Mishra", "medicine": "Paracetamol", "quantity": 3, "days": 5, "disease": "Fever" },
        //   { "doctor": "Shashibala Mishra", "medicine": "Pantoprazole", "quantity": 1000, "days": 5, "disease": "Abortion" }
        // ]`;

        // const jsonData = JSON.parse(temp_text);
        // setFormattedPrescription(JSON.stringify(jsonData, null, 2));  // Ensure readable JSON string
        // setPrescription(jsonData);  // Keep JSON for further use
        const temp = data.choices[0].message["content"];
        const cleanTemp = temp.startsWith("```json")
          ? temp.split("\n").slice(1, -1).join("\n")
          : temp;
        setFormattedPrescription(cleanTemp); // Ensure readable JSON string
        setPrescription(cleanTemp); // Keep JSON for further use
      } catch (error) {
        console.error("Error parsing JSON:", error);
        setFormattedPrescription("Error formatting prescription.");
      }
    }

    getFormattedPrescription();
  }, [recognizedText]); // Runs only when `recognizedText` changes

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        setDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  const dropdownContent = {
    About: "MediScan is a cutting-edge pharmacist assistant that scans prescriptions, generates a structured prescription table, verifies stock, and facilitates billing—all in one seamless process.",
    Contact: "For inquiries and support, reach out to us via email at support@mediscan.com or call us at (123) 456-7890.",
    Services: "Our services include prescription scanning, automated stock verification, seamless billing integration, and real-time medicine availability updates."
  };

  return (
    <Container>
      <Title>MediScan</Title>
      <Navbar>
        {Object.keys(dropdownContent).map((item) => (
          <Dropdown key={item} className="dropdown">
            <DropdownText onClick={(e) => { e.stopPropagation(); setDropdown(dropdown === item ? null : item); }}>
              {item} ⌄
            </DropdownText>
            <DropdownContent show={dropdown === item}>
              <p>{dropdownContent[item]}</p>
            </DropdownContent>
          </Dropdown>
        ))}
      </Navbar>
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
          <Button onClick={handleClick}>Generate Prescription</Button>
        </>
      )}
      <Button onClick={handleClickStockUpdate}>Go to Stock Update</Button>
    </Container>
  );
}

export default MainScreen;
