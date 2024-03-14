import { HashRouter, Route, Routes } from "react-router-dom";
import App from "./routes/app";
import LoadingOverlay from "./components/layouts/loading-layout";

export default () => (
  <HashRouter>
    <Routes>
      <Route element={<LoadingOverlay />}>
        <Route path="/" element={<App />} />
      </Route>
    </Routes>
  </HashRouter>
);
