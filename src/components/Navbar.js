import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <h2>Pharmacist Assistant</h2>
      <ul>
        <li><Link to="/">Main</Link></li>
        <li><Link to="/prescription">Prescription</Link></li>
        {/* <li><Link to="/stock">Stock</Link></li> */}
        {/* <li><Link to="/billing">Billing</Link></li> */}
      </ul>
    </nav>
  );
}

export default Navbar;
