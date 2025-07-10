import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Admin from "./admin";

export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
}

function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App/>} />
        <Route path="/admin" element={<Admin/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default Root; 