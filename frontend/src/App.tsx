import "./App.css";
import React from "react";
import { Header } from "./Header.tsx";
import AllInfoView from "./components/Views/AllInfoView/AllInfoView.tsx";
import { Navigate, Route, Routes } from "react-router-dom";
import CategoryView from "./components/Views/CategoryView/CategoryView.tsx";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/" element={<AllInfoView />} />
        <Route path="/categories" element={<CategoryView />} />
      </Routes>
    </>
  );
}

export default App;
