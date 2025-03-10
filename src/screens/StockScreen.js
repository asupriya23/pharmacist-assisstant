import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StockScreen = ({prescriptionData}) => {
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
    console.log("stockScreen", typeof(prescriptionData), prescriptionData);

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
            const updatedData = await Promise.all(
                prescriptionData.map(async (prescription) => {
                    try {
                        console.log("Checking stock for:", prescription.medicine);
                        const { data } = await axios.post("http://localhost:5001/check-stock", {
                            medicine: prescription.medicine,
                            requiredTablets: prescription.qty * prescription.days,
                        });
                        return { ...prescription, stock: data.available, cost: data.cost || 0 };
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
            console.log("item",item, requiredQty);
            if (item.available >= requiredQty) {
                total += item.cost * requiredQty;
            }
        });
        setBillAmount(total);
    };

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 px-4 py-2">Medicine Name</th>
                            <th className="border border-gray-300 px-4 py-2">Doctor</th>
                            <th className="border border-gray-300 px-4 py-2">No. of Tablets</th>
                            <th className="border border-gray-300 px-4 py-2">Available Tablets</th>
                            <th className="border border-gray-300 px-4 py-2">Bill Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stockData.map((item, index) => {
                            const requiredQty = item.qty * item.days;
                            return (
                                <tr key={index} className="text-center">
                                    <td className="border border-gray-300 px-4 py-2">{item.medicine}</td>
                                    <td className="border border-gray-300 px-4 py-2">{item.doctor}</td>
                                    <td className="border border-gray-300 px-4 py-2">{requiredQty}</td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {item.stock < requiredQty ? (
                                            <span className="text-red-600 font-bold">Not enough stock</span>
                                        ) : (
                                            item.stock
                                        )}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {item.stock >= requiredQty ? `₹${item.cost * requiredQty}` : "-"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
            <div className="mt-4 text-xl font-semibold">Total Bill: ₹{billAmount}</div>
            <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded"
                onClick={() => console.log("Proceed to checkout")}
            >
                Proceed to Checkout
            </button>
        </div>
    );
    // return (
    //     <div>
    //         nefoidn
    //     </div>
    // )
};

export default StockScreen;
