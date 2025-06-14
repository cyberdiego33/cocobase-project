import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DailyJournal from "./screens/Journal";
import Auth from "./components/Auth";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<DailyJournal isPublic={true} />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/my-journal"
            element={<DailyJournal isPublic={false} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
