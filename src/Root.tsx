import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

const App = lazy(() => import("./App"));
const Admin = lazy(() => import("./admin"));

export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
}

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
  </div>
);

function Root() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<App/>} />
          <Route path="/admin" element={<Admin/>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default Root; 