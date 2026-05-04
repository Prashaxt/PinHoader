import { BrowserRouter, Route, Routes } from "react-router-dom"
import Layout from "./Layout.jsx"
import './App.css'
import Home from "./components/Home.jsx"
import PrivacyPolicy from "./components/PrivacyPolicy.jsx"
import NotFound from "./components/NotFound.jsx"

function App() {
  

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}></Route>
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
