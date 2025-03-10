import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import MainScreen from "./screens/MainScreen";
import PrescriptionScreen from "./screens/PrescriptionScreen";
// import StockScreen from "./screens/StockScreen";
import StockScreen from "./screens/StockScreen";
// import BillingScreen from "./screens/BillingScreen";

function App() {
  const [prescriptionData, setPrescriptionData] = useState([]);

  return (
    <Routes>
      <Route
        path="/"
        element={<MainScreen onGeneratePrescription={setPrescriptionData} />}
      />
      <Route
        path="/prescription"
        element={<PrescriptionScreen prescriptionData={prescriptionData}  />}
      />
  
      <Route
        path="/stock"
        element={<StockScreen prescriptionData={prescriptionData} />}
      />
    </Routes>
  );
}

export default App;



{/* <Route path="/stock" element={<StockScreen />} />
  <Route path="/billing" element={<BillingScreen />} /> */}
