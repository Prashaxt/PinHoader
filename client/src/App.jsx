import { BrowserRouter, Route, Routes } from "react-router-dom"
import Layout from "./Layout.jsx"
import './App.css'
import Home from "./components/Home.jsx"

function App() {
  

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* <Route index element={<Home />} /> */}
        </Route>
      </Routes>
    </>
  )
}

export default App
