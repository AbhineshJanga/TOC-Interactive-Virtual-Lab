import { BrowserRouter, Routes, Route } from "react-router";
import Navbar from "./components/layout/Navbar";

import Home from "./pages/Home";
import Learn from "./pages/Learn";
import Experiment from "./pages/Experiment";
import NotFound from "./pages/NotFound";
function app() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/experiment" element={<Experiment />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
export default app;