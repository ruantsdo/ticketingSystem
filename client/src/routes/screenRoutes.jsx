//React
import React from "react";

//Router-DOM
import { BrowserRouter, Routes, Route } from "react-router-dom";

//Pages
import TokenCallDefault from "../pages/tokenCall/default";
import TokenCallAlternative from "../pages/tokenCall/alternative";

//Contexts
import { WebSocketProvider } from "../contexts/webSocket";

const ScreenRoutes = () => {
  return (
    <WebSocketProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/tokenCall/default"
            index
            element={<TokenCallDefault />}
          />
          <Route
            path="/tokenCall/alternative"
            element={<TokenCallAlternative />}
          />

          <Route path="*" element={<TokenCallDefault />} />
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  );
};

export default ScreenRoutes;
