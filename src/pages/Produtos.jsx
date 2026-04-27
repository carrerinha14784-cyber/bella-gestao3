import { useState, useEffect } from "react";

const STORAGE_KEY = "bella_produtos";
const ESTOQUE_BAIXO = 5;

const categorias = ["Vestuário", "Calçados", "Acessórios", "Bolsas", "Outros"];
const cores = ["Preto", "Branco", "Azul", "Vermelho", "Verde", "Rosa", "Amarelo", "Cinza", "Bege", "Outro"];
const tamanhos = ["PP", "P", "M", "G", "GG", "XG", "Único", "34", "35", "36", "37", "38", "39", "40", "41", "42"];

const produtoVazio = {
  nome: "",
  categoria: "",
  cor: "",
  tamanho: "",
  estoque: "",
  valor: "",
};

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState(produtoVazio);
  const [editandoId, setEditandoId] = useState(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    const salvos = localStorage.getItem(STORAGE_KEY);
    if (salvos) setProdutos(JSON.parse(salvos));
  }, []);

  function salvarStorage(lista) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    setProdutos(lista);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validar() {
    if (!form.nome.trim()) return "Informe o nome do produto.";
    if (!form.categoria) return "Selecione uma categoria.";
    if (!form.cor) return "Selecione uma cor.";
    if (!form.tamanho) return "Selecione um tamanho.";
    if (form.estoque === "" || isNaN(Number(form.estoque)) || Number(form.estoque) < 0)
      return "Estoque inválido.";
    if (form.valor === "" || isNaN(Number(form.valor)) || Number(form.valor) < 0)
      return "Valor inválido.";
    return "";
  }

  function handleSubmit() {
    const msgErro = validar();
    if (msgErro) { setErro(msgErro); return; }
    setErro("");

    if (editandoId !== null) {
      const atualizados = produtos.map((p) =>
        p.id === editandoId ? { ...form, id: editandoId } : p
      );
      salvarStorage(atualizados);
      setSucesso("Produto atualizado!");
      setEditandoId(null);
    } else {
      const novo = { ...form, id: Date.now() };
      salvarStorage([...produtos, novo]);
      setSucesso("Produto cadastrado!");
    }

    setForm(produtoVazio);
    setTimeout(() => setSucesso(""), 3000);
  }

  function handleEditar(produto) {
    setForm({ ...produto });
    setEditandoId(produto.id);
    setErro("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleExcluir(id) {
    const confirmado = window.confirm("Excluir este produto?");
    if (!confirmado) return;
    salvarStorage(produtos.filter((p) => p.id !== id));
  }

  function handleCancelar() {
    setForm(produtoVazio);
    setEditandoId(null);
    setErro("");
  }

  const produtosBaixoEstoque = produtos.filter(
    (p) => Number(p.estoque) <= ESTOQUE_BAIXO
  );

  return (
    <div style={estilos.pagina}>
      <h1 style={estilos.titulo}>📦 Produtos</h1>

      {/* Aviso estoque baixo */}
      {produtosBaixoEstoque.length > 0 && (
        <div style={estilos.alerta}>
          ⚠️ <strong>{produtosBaixoEstoque.length}</strong> produto(s) com estoque baixo:{" "}
          {produtosBaixoEstoque.map((p) => p.nome).join(", ")}
        </div>
      )}

      {/* Formulário */}
      <div style={estilos.card}>
        <h2 style={estilos.subtitulo}>
          {editandoId ? "✏️ Editar Produto" : "➕ Novo Produto"}
        </h2>

        <div style={estilos.grid}>
          <div style={estilos.campo}>
            <label style={estilos.label}>Nome *</label>
            <input
              style={estilos.input}
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Nome do produto"
            />
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Categoria *</label>
            <select style={estilos.input} name="categoria" value={form.categoria} onChange={handleChange}>
              <option value="">Selecione...</option>
              {categorias.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Cor *</label>
            <select style={estilos.input} name="cor" value={form.cor} onChange={handleChange}>
              <option value="">Selecione...</option>
              {cores.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Tamanho *</label>
            <select style={estilos.input} name="tamanho" value={form.tamanho} onChange={handleChange}>
              <option value="">Selecione...</option>
              {tamanhos.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Estoque *</label>
            <input
              style={estilos.input}
              name="estoque"
              type="number"
              min="0"
              value={form.estoque}
              onChange={handleChange}
              placeholder="Qtd em estoque"
            />
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>Valor (R$) *</label>
            <input
              style={estilos.input}
              name="valor"
              type="number"
              min="0"
              step="0.01"
              value={form.valor}
              onChange={handleChange}
              placeholder="0,00"
            />
          </div>
        </div>

        {erro && <p style={estilos.erro}>{erro}</p>}
        {sucesso && <p style={estilos.sucessoMsg}>{sucesso}</p>}

        <div style={estilos.botoes}>
          <button style={estilos.btnPrimario} onClick={handleSubmit}>
            {editandoId ? "Salvar Alterações" : "Cadastrar Produto"}
          </button>
          {editandoId && (
            <button style={estilos.btnSecundario} onClick={handleCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div style={estilos.card}>
        <h2 style={estilos.subtitulo}>📋 Produtos Cadastrados ({produtos.length})</h2>
        {produtos.length === 0 ? (
          <p style={{ color: "#888", textAlign: "center", padding: "24px" }}>
            Nenhum produto cadastrado ainda.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={estilos.tabela}>
              <thead>
                <tr>
                  {["Nome", "Categoria", "Cor", "Tamanho", "Estoque", "Valor", "Ações"].map((h) => (
                    <th key={h} style={estilos.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => {
                  const baixo = Number(p.estoque) <= ESTOQUE_BAIXO;
                  return (
                    <tr key={p.id} style={baixo ? estilos.trAlerta : estilos.tr}>
                      <td style={estilos.td}>{p.nome}</td>
                      <td style={estilos.td}>{p.categoria}</td>
                      <td style={estilos.td}>{p.cor}</td>
                      <td style={estilos.td}>{p.tamanho}</td>
                      <td style={{ ...estilos.td, fontWeight: "600", color: baixo ? "#c0392b" : "#27ae60" }}>
                        {p.estoque} {baixo && "⚠️"}
                      </td>
                      <td style={estilos.td}>
                        R$ {Number(p.valor).toFixed(2).replace(".", ",")}
                      </td>
                      <td style={estilos.td}>
                        <button style={estilos.btnEditar} onClick={() => handleEditar(p)}>Editar</button>
                        <button style={estilos.btnExcluir} onClick={() => handleExcluir(p.id)}>Excluir</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const estilos = {
  pagina: {
    padding: "24px",
    maxWidth: "1100px",
    margin: "0 auto",
    fontFamily: "'Segoe UI', sans-serif",
  },
  titulo: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: "20px",
  },
  subtitulo: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#34495e",
    marginBottom: "16px",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  alerta: {
    background: "#fff3cd",
    border: "1px solid #ffc107",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "20px",
    color: "#856404",
    fontSize: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  campo: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#555" },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    transition: "border 0.2s",
  },
  erro: { color: "#c0392b", fontSize: "13px", marginBottom: "8px" },
  sucessoMsg: { color: "#27ae60", fontSize: "13px", marginBottom: "8px" },
  botoes: { display: "flex", gap: "12px" },
  btnPrimario: {
    background: "#2c3e50",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnSecundario: {
    background: "#ecf0f1",
    color: "#555",
    border: "none",
    borderRadius: "8px",
    padding: "10px 24px",
    fontSize: "14px",
    cursor: "pointer",
  },
  tabela: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    background: "#f4f6f8",
    padding: "12px 14px",
    textAlign: "left",
    fontWeight: "600",
    color: "#444",
    borderBottom: "2px solid #e0e0e0",
    whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #f0f0f0" },
  trAlerta: { borderBottom: "1px solid #f0f0f0", background: "#fff9f0" },
  td: { padding: "11px 14px", color: "#333", verticalAlign: "middle" },
  btnEditar: {
    background: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "13px",
    cursor: "pointer",
    marginRight: "6px",
  },
  btnExcluir: {
    background: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "13px",
    cursor: "pointer",
  },
};
