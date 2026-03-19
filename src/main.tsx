import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App as AntdApp, ConfigProvider } from "antd";

import "./index.css";
import AppLayout from "./components/layout/AppLayout";
import { AntdAppInitializer } from "./components/providers/AntdAppInitializer";
import App from "./App";
import viVN from "antd/locale/vi_VN";
// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

createRoot(document.getElementById("root")!).render(<BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 12,
          },
        }}
        locale={viVN}
      >
        <AntdApp
          notification={{
            placement: "topRight",
            duration: 3,
            maxCount: 4,
          }}
        >
          <AntdAppInitializer />
          <App />
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>);