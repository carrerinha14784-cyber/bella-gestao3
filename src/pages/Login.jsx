import { useState } from "react";
import { supabase } from "../supabaseClient.js";

export default function Login() {
  const [email, setEmail]           = useState("");
  const [senha, setSenha]           = useState("");
  const [erro, setErro]             = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !senha.trim()) {
      setErro("Preencha e-mail e senha.");
      return;
    }
    setErro("");
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setCarregando(false);

    if (error) {
      if (error.message === "Invalid login credentials") {
        setErro("E-mail ou senha incorretos.");
      } else {
        setErro("Erro ao entrar. Tente novamente.");
      }
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <div style={estilos.pagina}>
      <div style={estilos.card}>
        <div style={estilos.logoWrap}>
          <span style={estilos.logoTexto}>Bella</span>
          <span style={estilos.logoSub}>GESTÃO</span>
        </div>

        <h2 style={estilos.titulo}>Entrar na sua conta</h2>

        <div style={estilos.campo}>
          <label style={estilos.label}>E-mail</label>
          <input
            style={estilos.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="seuemail@exemplo.com"
            autoComplete="email"
          />
        </div>

        <div style={estilos.campo}>
          <label style={estilos.label}>Senha</label>
          <input
            style={estilos.input}
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {erro && <p style={estilos.erro}>{erro}</p>}

        <button
          style={{
            ...estilos.btnEntrar,
            opacity: carregando ? 0.7 : 1,
            cursor: carregando ? "not-allowed" : "pointer",
          }}
          onClick={handleLogin}
          disabled={carregando}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <p style={estilos.rodape}>Bella Gestão · Acesso restrito</p>
      </div>
    </div>
  );
}

const estilos = {
  pagina: {
    minHeight: "100vh",
    background: "#f4f6f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "24px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
  },
  logoWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "28px",
  },
  logoTexto: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#2c3e50",
    letterSpacing: "1px",
    lineHeight: 1,
  },
  logoSub: {
    fontSize: "11px",
    color: "#95a5a6",
    letterSpacing: "4px",
    textTransform: "uppercase",
    marginTop: "2px",
  },
  titulo: {
    fontSize: "17px",
    fontWeight: "600",
    color: "#34495e",
    textAlign: "center",
    marginBottom: "24px",
  },
  campo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "16px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#555",
  },
  input: {
    padding: "11px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    fontFamily: "'Segoe UI', sans-serif",
  },
  erro: {
    color: "#c0392b",
    fontSize: "13px",
    marginBottom: "12px",
    textAlign: "center",
    fontWeight: "500",
  },
  btnEntrar: {
    width: "100%",
    background: "#2c3e50",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "13px",
    fontSize: "15px",
    fontWeight: "700",
    marginTop: "4px",
    marginBottom: "20px",
  },
  rodape: {
    textAlign: "center",
    fontSize: "12px",
    color: "#bbb",
  },
};
