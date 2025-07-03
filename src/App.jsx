import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DailyJournal from "./screens/Journal";
import Auth from "./components/Auth";

/**
 * Main App component handling routing:
 * / - Public journal view
 * /auth - Login/Register page
 * /my-journal - Private journal entries
 */
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public view: Shows all public entries */}
          <Route path="/" element={<DailyJournal isPublic={true} />} />

          {/* Authentication page for login/register */}
          <Route path="/auth" element={<Auth />} />

          {/* Private view: Shows only user's entries */}
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
