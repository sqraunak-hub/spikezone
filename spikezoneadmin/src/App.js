import { ProSidebarProvider } from "react-pro-sidebar";
import "./App.css";
import "./Assets/css/admin-theme.css";
import Router from "./Routes/Router";

function App() {
  return (
    <ProSidebarProvider>
      <Router />
    </ProSidebarProvider>
  );
}

export default App;
