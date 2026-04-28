import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./supabaseClient.js";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import "./styles.css";

function Root() {
  const [sessao, setSessao]         = useState(undefined);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessao(session);
      setCarregando(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSessao(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (carregando) {
    return (
      <div style={estilosRoot.loading}>
        <div style={estilosRoot.loadingInner}>
          <span style={estilosRoot.loadingLogo}>Bella</span>
          <span style={estilosRoot.loadingDots}>Carregando...</span>
        </div>
      </div>
    );
  }

  return sessao ? <App /> : <Login />;
}

const estilosRoot = {
  loading: {
    minHeight: "100vh",
    background: "#f4f6f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
  },
  loadingInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  loadingLogo: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#2c3e50",
  },
  loadingDots: {
    fontSize: "13px",
    color: "#aaa",
    letterSpacing: "1px",
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
