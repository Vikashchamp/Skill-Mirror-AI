import { BrowserRouter, Routes, Route } from "react-router-dom"

import Landing from "./pages/Landing"
import History from "./pages/History"
import Setup from "./pages/Setup"
import Interview from "./pages/Interview"
import Processing from "./pages/Processing"
import Results from "./pages/Results"
import Login from "./pages/Login"
import Register from "./pages/Register"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Main Dashboard */}
        <Route path="/" element={<Landing />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Interview Flow */}
        <Route path="/setup" element={<Setup />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/processing" element={<Processing />} />

        {/* Results */}
        <Route path="/results" element={<Results />} />
        <Route path="/results/:interviewId" element={<Results />} />

        {/* Interview History */}
        <Route path="/history" element={<History />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App