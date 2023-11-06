import React from "react";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useTheme } from "next-themes";

export default function Notification() {
  const { theme } = useTheme();
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={true}
      pauseOnFocusLoss={false}
      closeOnClick
      rtl={false}
      draggable
      pauseOnHover
      theme={theme}
    />
  );
}
