import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Card,
  CardContent,
  Typography,
  Button as MuiButton,
} from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #e3f2fd;
  padding: 40px 20px;
`;

const StyledCard = styled(Card)`
  padding: 24px;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 900px;
  background-color: #ffffff;
  border-radius: 10px;
  text-align: center;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  border-radius: 10px;
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
  display: block;
  margin: 20px auto 0; /* Centers the button */

  &:hover {
    background-color: ${props => (props.primary ? '#1565c0' : '#42a5f5')};
    box-shadow: 6px 6px 14px rgba(0, 0, 0, 0.3);
  }
`;
const StockScreen = ({ prescriptionData }) => {
  console.log("Rendering StockScreen");

  /*

- Retrieve stock details for each prescription in prescriptionData (using api requests to check-med-server.js at port 5001)
- Display the following in a table format
    - medicine name
    - doctor
    - no.of tablets (qty * days)
    - available tablets
    - bill amount (cost of tablet * no of tablets)
        - if stock < req no of tablets (then write in RED BOLD TEXT "not enough stock") and dont consider this in the bill

- Button to proceed for checkout and bill pdf generation (continue to checkout page...)

*/

  console.log("dsnxojfdncv", prescriptionData);

  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billAmount, setBillAmount] = useState(0);

  useEffect(() => {
    console.log("useEffect triggered with prescriptionData:", prescriptionData);
    if (!Array.isArray(prescriptionData)) {
      console.warn("prescriptionData is not an array:", prescriptionData);
      setStockData([]); // Set empty state to prevent further errors
      setLoading(false);
      return;
    }

    async function fetchStockDetails() {
      console.log("Fetching stock details...");
      console.log(prescriptionData);
      const updatedData = await Promise.all(
        prescriptionData.map(async (prescription) => {
          console.log("hiiii",prescription);
          try {
            console.log("Checking stock for:", prescription.medicine);
            const { data } = await axios.post(
              "http://localhost:5001/check-stock",
              {
                medicine: prescription.medicine,
                requiredTablets: prescription.quantity * prescription.days,
              }
            );
            console.log("data", data);
            return {
              ...prescription,
              stock: data.available,
              cost: data.cost || 0,
            };
          } catch (error) {
            console.error("Error fetching stock:", error);
            return { ...prescription, stock: 0, cost: 0 };
          }
        })
      );
      setStockData(updatedData);
      calculateBill(updatedData);
      setLoading(false);
    }

    fetchStockDetails();
  }, [prescriptionData]);

  const calculateBill = (data) => {
    let total = 0;
    data.forEach((item) => {
      const requiredQty = item.quantity * item.days;
      if (item.stock >= requiredQty) {
        total += item.cost * requiredQty;
      }
    });
    setBillAmount(total);
  };

  async function generatePDF() {
    try {
      await Promise.all(
        stockData.map(async (item) => {
          const requiredQty = item.quantity * item.days;
          if (item.stock >= requiredQty) {
            try {
                console.log(item.stock, requiredQty);
              await axios.post("http://localhost:5001/deduct-stock", {
                medicine: item.medicine,
                quantity: requiredQty,
              });
              console.log(item);
            } catch (error) {
              console.error(
                `Error deducting stock for ${item.medicine}:`,
                error
              );
            }
          }
        })
      );

      const doc = new jsPDF();
      console.log(doc.getFontList());

      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("MediScan", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Invoice No: #${Math.floor(Math.random() * 100000)}`, 150, 30);

      const tableColumn = [
        "Medicine Name",
        "Doctor",
        "Required Tablets",
        "Price (Rs.)",
      ];
      const tableRows = [];

      let totalAmount = 0;

      stockData.forEach((item) => {
        const requiredQty = item.quantity * item.days;
        if (item.stock >= requiredQty) {
          const cost = item.cost * requiredQty;
          totalAmount += cost;
          tableRows.push([
            item.medicine,
            item.doctor,
            requiredQty,
            `Rs.${cost}`,
          ]);
        }
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: "striped",
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [230, 247, 255] },
        tableLineColor: [44, 62, 80],
        tableLineWidth: 0.2,
      });

      doc.setFontSize(14);
      doc.text(
        `Total Bill: Rs.${totalAmount}`,
        14,
        doc.lastAutoTable.finalY + 10
      );

      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(0.5);
      doc.line(
        14,
        doc.lastAutoTable.finalY + 15,
        200,
        doc.lastAutoTable.finalY + 15
      );

      doc.setFontSize(10);
      doc.text(
        "Thank you for choosing our service!",
        105,
        doc.lastAutoTable.finalY + 25,
        { align: "center" }
      );

      doc.save("Medicine_Bill.pdf");
    } catch (error) {
      console.error("Error during PDF generation or stock deduction:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <StyledCard>
        {loading ? (
          <Typography className="text-center text-gray-500 text-lg">
            Loading...
          </Typography>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Doctor</th>
                <th>Required Tablets</th>
                <th>Available Tablets</th>
                <th>Bill Amount</th>
              </tr>
            </thead>
            <tbody>
              {stockData.map((item, index) => {
                const requiredQty = item.quantity * item.days;
                return (
                  <tr key={index}>
                    <td>{item.medicine}</td>
                    <td>{item.doctor}</td>
                    <td>{requiredQty}</td>
                    <td>
                      {item.stock < requiredQty ? (
                        <>
                          <Typography color="error" fontWeight="bold">
                            {item.stock} (Low Stock)
                          </Typography>
                          <Button onClick={() => window.open("https://pharmeasy.in/", "_blank")}>Order Now</Button>
                        </>
                      ) : (
                        <Typography color="success" fontWeight="bold">
                          {item.stock}
                        </Typography>
                      )}
                    </td>
                    <td>{item.stock >= requiredQty ? `Rs.${item.cost * requiredQty}` : "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
        <Typography className="mt-6 text-2xl font-semibold text-blue-600 text-center">
          Total Bill: Rs.{billAmount}
        </Typography>
        <Button primary onClick={generatePDF}>Print Bill</Button>
      </StyledCard>
    </Container>
  );
};

export default StockScreen;