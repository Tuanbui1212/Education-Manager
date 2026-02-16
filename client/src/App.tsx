import { BrowserRouter, Routes, Route } from "react-router-dom";

import { publicRoutes, privateRoutes } from "./routes";
import ScrollToTop from "./hooks/ScrollToTop";
// import PrivateRoute from "./hooks/PrivateRoute";
import DefaultLayout from "./layouts/DefaultLayout";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <div className="App">
        <Routes>
          {/* 🟢 1. XỬ LÝ PUBLIC ROUTES */}
          {publicRoutes.map((route, index) => {
            const Page = route.component;
            const Layout = route.layout ?? DefaultLayout;

            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <Layout>
                    <Page />
                  </Layout>
                }
              />
            );
          })}

          {/* 🔒 2. XỬ LÝ PRIVATE ROUTES (Bảo vệ) */}
          {privateRoutes.map((route, index) => {
            const Page = route.component;
            const Layout = route.layout;

            return (
              <Route
                key={index}
                path={route.path}
                element={
                  // <PrivateRoute>
                  <Layout>
                    <Page />
                  </Layout>
                  // </PrivateRoute>
                }
              />
            );
          })}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
