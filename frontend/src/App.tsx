import { Routes, Route } from "react-router-dom";
import { Home } from "./screens/Home";
import { Onboarding } from "./screens/Onboarding";
import { Matching } from "./screens/Matching";
import { Chat } from "./screens/Chat";
import { DateIng } from "./screens/DateIng";
import { Profile } from "./screens/Profile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/matching" element={<Matching />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/date" element={<DateIng />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}
