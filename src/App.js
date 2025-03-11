import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import MainScreen from "./screens/MainScreen";
import PrescriptionScreen from "./screens/PrescriptionScreen";
// import StockScreen from "./screens/StockScreen";
import StockScreen from "./screens/StockScreen";
import StockUpdateScreen from "./screens/StockUpdateScreen";
// import BillingScreen from "./screens/BillingScreen";

function App() {
  const [prescriptionData, setPrescriptionData] = useState([]);

  return (
    <Routes>
      <Route
        path="/"
        element={<MainScreen setPrescriptionData={setPrescriptionData} />}
      />
      <Route
        path="/prescription"
        element={<PrescriptionScreen setPrescriptionData={setPrescriptionData} prescriptionData={prescriptionData}  />}
      />
  
      <Route
        path="/stock"
        element={<StockScreen prescriptionData={prescriptionData} />}
      />
      
      <Route
        path="/update"
        element={<StockUpdateScreen/>}
      />
    </Routes>
  );
}

export default App;