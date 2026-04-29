import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient.js";

const clienteVazio = {
  nome: "",
  telefone: "",
  observacoes: "",
};

function formatarTelefone(valor) {
  const nums = valor.replace(/\D/g, "").slice(0, 11);
  if (nums.length <= 10) {
    return nums.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  }
  return nums.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
}

export default function Clientes() {
  const [clientes, setClientes]     = useState([]);
  const [form, setForm]             = useState(clienteVazio);
  const [editandoId, setEditandoId] = useState(null);
  const [busca, setBusca]           = useState("");
  const [erro, setErro]             = useState("");
  const [sucesso, setSucesso]       = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    setCarregando(true);
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setClientes(data || []);
    setCarregando(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "telefone") {
      setForm({ ...form, telefone: formatarTelefone(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  function validar() {
    if (!form.nome.trim()) return "Informe o nome do cliente.";
    if (!form.telefone.trim()) return "Informe o telefone.";
    return "";
  }

  async function handleSubmit() {
    const msgErro = validar();
    if (msgErro) { setErro(msgErro); return; }
    setErro("");

    const payload = {
      nome:        form.nome.trim(),
      telefone:    form.telefone,
      observacoes: form.observacoes,
    };

    if (editandoId !== null) {
      const { error } = await supabase
        .from("clientes")
        .update(payload)
        .eq("id", editandoId);
      if (error) { setErro("Erro ao atualizar cliente."); return; }
      setSucesso("Cliente atualizado com sucesso!");
      setEditandoId(null);
    } else {
      const { error } = await supabase
        .from("clientes")
        .insert([payload]);
      if (error) { setErro("Erro ao cadastrar cliente."); return; }
      setSucesso("Cliente cadastrado com sucesso!");
    }

    setForm(clienteVazio);
    carregarClientes();
    setTimeout(() => setSucesso(""), 3000);
  }

  function handleEditar(cliente) {
    setForm({
      nome:        cliente.nome,
      telefone:    cliente.telefone,
      observacoes: cliente.observacoes || "",
    });
    setEditandoId(cliente.id);
    setErro("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleExcluir(id) {
    if (!window.confirm("Deseja excluir este cliente?")) return;
    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) { setErro("Erro ao excluir cliente."); return; }
    carregarClientes();
  }

  function handleCancelar() {
    setForm(clienteVazio);
    setEditandoId(null);
    setErro("");
  }

  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.telefone.includes(busca)
  );

  return (
    <div style={estilos.pagina}>
      <h1 style={estilos.titulo}>👥 Clientes</h1>

      <div style={estilos.card}>
        <h2 style={estilos.subtitulo}>
          {editandoId ? "✏️ Editar Cliente" : "➕ Novo Cliente"}
        </h2>

        <div style={estilos.grid}>
          <div style={estilos.campo}>
            <label style={estilos.label}>Nome *</label>
            <input
              style={estilos.input}
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Nome completo"
            />
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Telefone *</label>
            <input
              style={estilos.input}
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div style={{ ...estilos.campo, gridColumn: "1 / -1" }}>
            <label style={estilos.label}>Observações</label>
            <textarea
              style={{ ...estilos.input, resize: "vertical", minHeight: "80px" }}
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              placeholder="Preferências, informações adicionais..."
            />
          </div>
        </div>

        {erro && <p style={estilos.erro}>{erro}</p>}
        {sucesso && <p style={estilos.sucessoMsg}>{sucesso}</p>}

        <div style={estilos.botoes}>
          <button style={estilos.btnPrimario} onClick={handleSubmit}>
            {editandoId ? "Salvar Alterações" : "Cadastrar Cliente"}
          </button>
          {editandoId && (
            <button style={estilos.btnSecundario} onClick={handleCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div style={estilos.card}>
        <div style={estilos.cabecalhoTabela}>
          <h2 style={{ ...estilos.subtitulo, marginBottom: 0 }}>
            📋 Clientes Cadastrados ({clientes.length})
          </h2>
          <input
            style={estilos.busca}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="🔍 Buscar por nome ou telefone..."
          />
        </div>

        {carregando ? (
          <p style={estilos.vazio}>Carregando...</p>
        ) : clientesFiltrados.length === 0 ? (
          <p style={estilos.vazio}>
            {busca ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda."}
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={estilos.tabela}>
              <thead>
                <tr>
                  {["Nome", "Telefone", "Observações", "Ações"].map((h) => (
                    <th key={h} style={estilos.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((c) => (
                  <tr key={c.id} style={estilos.tr}>
                    <td style={{ ...estilos.td, fontWeight: "600" }}>{c.nome}</td>
                    <td style={estilos.td}>{c.telefone}</td>
                    <td style={{ ...estilos.td, color: "#777", fontStyle: c.observacoes ? "normal" : "italic" }}>
                      {c.observacoes || "—"}
                    </td>
                    <td style={estilos.td}>
                      <button style={estilos.btnEditar} onClick={() => handleEditar(c)}>Editar</button>
                      <button style={estilos.btnExcluir} onClick={() => handleExcluir(c.id)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const estilos = {
  pagina: { padding: "24px", maxWidth: "1100px", margin: "0 auto", fontFamily: "'Segoe UI', sans-serif" },
  titulo: { fontSize: "28px", fontWeight: "700", color: "#2c3e50", marginBottom: "20px" },
  subtitulo: { fontSize: "18px", fontWeight: "600", color: "#34495e", marginBottom: "16px" },
  card: { background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px", marginBottom: "16px" },
  campo: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#555" },
  input: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none", fontFamily: "'Segoe UI', sans-serif" },
  erro: { color: "#c0392b", fontSize: "13px", marginBottom: "8px" },
  sucessoMsg: { color: "#27ae60", fontSize: "13px", marginBottom: "8px" },
  botoes: { display: "flex", gap: "12px" },
  btnPrimario: { background: "#2c3e50", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  btnSecundario: { background: "#ecf0f1", color: "#555", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "14px", cursor: "pointer" },
  cabecalhoTabela: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" },
  busca: { padding: "9px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none", minWidth: "260px" },
  tabela: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
  th: { background: "#f4f6f8", padding: "12px 14px", textAlign: "left", fontWeight: "600", color: "#444", borderBottom: "2px solid #e0e0e0", whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid #f0f0f0" },
  td: { padding: "11px 14px", color: "#333", verticalAlign: "middle" },
  btnEditar: { background: "#3498db", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "13px", cursor: "pointer", marginRight: "6px" },
  btnExcluir: { background: "#e74c3c", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "13px", cursor: "pointer" },
  vazio: { color: "#888", textAlign: "center", padding: "24px" },
};
