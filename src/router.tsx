import { RouterProvider, createHashRouter } from "react-router-dom";
import App from "./routes/app";

const router = createHashRouter([
    {
        path: "/",
        element: <App />,
    }
])

export default () => <RouterProvider router={router} />;