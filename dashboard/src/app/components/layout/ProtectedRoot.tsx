import { Navigate, Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { PeriodFilterProvider } from "../../contexts/PeriodFilterContext";
import { SheetDataProvider } from "../../contexts/SheetDataContext";

/** Checks sessionStorage for auth token; redirects to /login if absent. */
export function ProtectedRoot() {
  const authed = sessionStorage.getItem("tving_authed") === "1";

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SheetDataProvider>
      <PeriodFilterProvider>
        <div
          style={{
            display: "flex",
            height: "100vh",
            background: "#141428",
            overflow: "hidden",
            fontFamily: "Pretendard, Inter, sans-serif",
          }}
        >
          <Sidebar />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            <Header />
            <main
              id="main-scroll"
              style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              <Outlet />
            </main>
          </div>

          <style>{`
            #main-scroll::-webkit-scrollbar { width: 5px; }
            #main-scroll::-webkit-scrollbar-track { background: #141428; }
            #main-scroll::-webkit-scrollbar-thumb { background: #353F66; border-radius: 3px; }
            #main-scroll::-webkit-scrollbar-thumb:hover { background: #6C63FF; }
          `}</style>
        </div>
      </PeriodFilterProvider>
    </SheetDataProvider>
  );
}