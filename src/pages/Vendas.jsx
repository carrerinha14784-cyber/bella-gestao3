import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient.js";

const PAGAMENTOS = ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Pix", "Fiado"];

export default function Vendas() {
  const [produtos, setProdutos]           = useState([]);
  const [clientes, setClientes]           = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState("balcao");
  const [buscaProduto, setBuscaProduto]   = useState("");
  const [carrinho, setCarrinho]           = useState([]);
  const [pagamento, setPagamento]         = useState("Dinheiro");
  const [sucesso, setSucesso]             = useState("");
  const [erro, setErro]                   = useState("");
  const [finalizando, setFinalizando]     = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const [{ data: prods }, { data: clts }] = await Promise.all([
      supabase.from("produtos").select("*").order("nome"),
      supabase.from("clientes").select("*").order("nome"),
    ]);
    setProdutos(prods || []);
    setClientes(clts || []);
  }

  const produtosFiltrados = produtos.filter((p) => {
    const jaNoCarrinho = carrinho.find((c) => c.id === p.id);
    const estoqueDisponivel = jaNoCarrinho
      ? Number(p.estoque) - jaNoCarrinho.quantidade > 0
      : Number(p.estoque) > 0;
    return (
      p.nome.toLowerCase().includes(buscaProduto.toLowerCase()) &&
      estoqueDisponivel
    );
  });

  function adicionarAoCarrinho(produto) {
    setCarrinho((prev) => {
      const existe = prev.find((c) => c.id === produto.id);
      if (existe) {
        return prev.map((c) =>
          c.id === produto.id ? { ...c, quantidade: c.quantidade + 1 } : c
        );
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });
    setBuscaProduto("");
  }

  function alterarQuantidade(id, novaQtd) {
    const produto = produtos.find((p) => p.id === id);
    const estoqueMax = Number(produto?.estoque || 0);
    if (novaQtd < 1 || novaQtd > estoqueMax) return;
    setCarrinho((prev) =>
      prev.map((c) => (c.id === id ? { ...c, quantidade: novaQtd } : c))
    );
  }

  function removerDoCarrinho(id) {
    setCarrinho((prev) => prev.filter((c) => c.id !== id));
  }

  const total = carrinho.reduce(
    (acc, item) => acc + Number(item.valor) * item.quantidade, 0
  );

  async function finalizarVenda() {
    if (carrinho.length === 0) {
      setErro("Adicione pelo menos um produto ao carrinho.");
      return;
    }
    setErro("");
    setFinalizando(true);

    // Montar nome do cliente
    const nomeCliente =
      clienteSelecionado === "balcao"
        ? "Balcão"
        : clientes.find((c) => c.id === Number(clienteSelecionado))?.nome || "Balcão";

    // Salvar venda
    const { error: erroVenda } = await supabase.from("vendas").insert([{
      cliente:    nomeCliente,
      pagamento,
      status:     pagamento === "Fiado" ? "Fiado" : "Pago",
      total,
      valor_recebido: 0,
      itens: carrinho.map((c) => ({
        nome:       c.nome,
        quantidade: c.quantidade,
        valor:      Number(c.valor),
        subtotal:   Number(c.valor) * c.quantidade,
      })),
    }]);

    if (erroVenda) {
      setErro("Erro ao salvar venda.");
      setFinalizando(false);
      return;
    }

    // Baixar estoque de cada produto
    for (const item of carrinho) {
      const produto = produtos.find((p) => p.id === item.id);
      if (produto) {
        await supabase
          .from("produtos")
          .update({ estoque: Number(produto.estoque) - item.quantidade })
          .eq("id", item.id);
      }
    }

    // Resetar
    await carregarDados();
    setCarrinho([]);
    setClienteSelecionado("balcao");
    setPagamento("Dinheiro");
    setFinalizando(false);
    setSucesso(`Venda finalizada! Total: R$ ${total.toFixed(2).replace(".", ",")}`);
    setTimeout(() => setSucesso(""), 4000);
  }

  return (
    <div style={estilos.pagina}>
      <h1 style={estilos.titulo}>🛒 Vendas</h1>

      <div style={estilos.layout}>
        {/* Coluna esquerda */}
        <div style={estilos.colunaEsquerda}>

          <div style={estilos.card}>
            <h2 style={estilos.subtitulo}>👤 Cliente</h2>
            <select
              style={estilos.input}
              value={clienteSelecionado}
              onChange={(e) => setClienteSelecionado(e.target.value)}
            >
              <option value="balcao">🏪 Balcão (sem cadastro)</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} — {c.telefone}
                </option>
              ))}
            </select>
          </div>

          <div style={estilos.card}>
            <h2 style={estilos.subtitulo}>🔍 Buscar Produto</h2>
            <input
              style={estilos.input}
              value={buscaProduto}
              onChange={(e) => setBuscaProduto(e.target.value)}
              placeholder="Digite o nome do produto..."
            />
            {buscaProduto && (
              <div style={estilos.listaBusca}>
                {produtosFiltrados.length === 0 ? (
                  <p style={estilos.semResultado}>Nenhum produto encontrado ou sem estoque.</p>
                ) : (
                  produtosFiltrados.map((p) => (
                    <div key={p.id} style={estilos.itemBusca} onClick={() => adicionarAoCarrinho(p)}>
                      <span style={estilos.itemBuscaNome}>{p.nome}</span>
                      <span style={estilos.itemBuscaInfo}>{p.tamanho} · {p.cor} · Estoque: {p.estoque}</span>
                      <span style={estilos.itemBuscaValor}>R$ {Number(p.valor).toFixed(2).replace(".", ",")}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div style={estilos.card}>
            <h2 style={estilos.subtitulo}>💳 Forma de Pagamento</h2>
            <div style={estilos.gridPagamento}>
              {PAGAMENTOS.map((p) => (
                <button
                  key={p}
                  style={pagamento === p ? estilos.btnPagAtivo : estilos.btnPag}
                  onClick={() => setPagamento(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Carrinho */}
        <div style={estilos.colunaDireita}>
          <div style={estilos.card}>
            <h2 style={estilos.subtitulo}>🛍️ Carrinho</h2>

            {carrinho.length === 0 ? (
              <p style={estilos.semResultado}>Nenhum produto adicionado.</p>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={estilos.tabela}>
                    <thead>
                      <tr>
                        {["Produto", "Qtd", "Valor Unit.", "Subtotal", ""].map((h) => (
                          <th key={h} style={estilos.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {carrinho.map((item) => {
                        const estoqueMax = Number(produtos.find((p) => p.id === item.id)?.estoque || 0);
                        return (
                          <tr key={item.id} style={estilos.tr}>
                            <td style={estilos.td}>
                              <span style={{ fontWeight: 600 }}>{item.nome}</span>
                              <br />
                              <span style={{ fontSize: "12px", color: "#888" }}>{item.tamanho} · {item.cor}</span>
                            </td>
                            <td style={estilos.td}>
                              <div style={estilos.qtdControle}>
                                <button style={estilos.btnQtd} onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}>−</button>
                                <span style={estilos.qtdNumero}>{item.quantidade}</span>
                                <button style={estilos.btnQtd} onClick={() => alterarQuantidade(item.id, item.quantidade + 1)} disabled={item.quantidade >= estoqueMax}>+</button>
                              </div>
                            </td>
                            <td style={estilos.td}>R$ {Number(item.valor).toFixed(2).replace(".", ",")}</td>
                            <td style={{ ...estilos.td, fontWeight: 600, color: "#2c3e50" }}>
                              R$ {(Number(item.valor) * item.quantidade).toFixed(2).replace(".", ",")}
                            </td>
                            <td style={estilos.td}>
                              <button style={estilos.btnRemover} onClick={() => removerDoCarrinho(item.id)}>✕</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={estilos.totalBox}>
                  <span style={estilos.totalLabel}>Total</span>
                  <span style={estilos.totalValor}>R$ {total.toFixed(2).replace(".", ",")}</span>
                </div>
              </>
            )}

            {erro && <p style={estilos.erro}>{erro}</p>}
            {sucesso && <p style={estilos.sucessoMsg}>{sucesso}</p>}

            <button
              style={{
                ...estilos.btnFinalizar,
                opacity: (carrinho.length === 0 || finalizando) ? 0.5 : 1,
                cursor: (carrinho.length === 0 || finalizando) ? "not-allowed" : "pointer",
              }}
              onClick={finalizarVenda}
              disabled={finalizando}
            >
              {finalizando ? "Salvando..." : "✅ Finalizar Venda"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const estilos = {
  pagina: { padding: "24px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Segoe UI', sans-serif" },
  titulo: { fontSize: "28px", fontWeight: "700", color: "#2c3e50", marginBottom: "20px" },
  subtitulo: { fontSize: "16px", fontWeight: "600", color: "#34495e", marginBottom: "14px" },
  layout: { display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px", alignItems: "start" },
  colunaEsquerda: { display: "flex", flexDirection: "column", gap: "20px" },
  colunaDireita: { display: "flex", flexDirection: "column", gap: "20px" },
  card: { background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  input: { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "'Segoe UI', sans-serif" },
  listaBusca: { marginTop: "8px", border: "1px solid #e0e0e0", borderRadius: "8px", overflow: "hidden" },
  itemBusca: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f0f0f0", gap: "8px", flexWrap: "wrap", background: "#fff" },
  itemBuscaNome: { fontWeight: "600", fontSize: "14px", color: "#2c3e50", flex: 1 },
  itemBuscaInfo: { fontSize: "12px", color: "#888" },
  itemBuscaValor: { fontSize: "14px", fontWeight: "700", color: "#27ae60" },
  semResultado: { color: "#999", fontSize: "14px", padding: "8px 0" },
  gridPagamento: { display: "flex", flexWrap: "wrap", gap: "8px" },
  btnPag: { background: "#ecf0f1", border: "1px solid #ddd", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", cursor: "pointer", color: "#555" },
  btnPagAtivo: { background: "#2c3e50", border: "1px solid #2c3e50", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", cursor: "pointer", color: "#fff", fontWeight: "600" },
  tabela: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
  th: { background: "#f4f6f8", padding: "10px 12px", textAlign: "left", fontWeight: "600", color: "#444", borderBottom: "2px solid #e0e0e0", whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid #f0f0f0" },
  td: { padding: "10px 12px", color: "#333", verticalAlign: "middle" },
  qtdControle: { display: "flex", alignItems: "center", gap: "8px" },
  btnQtd: { width: "28px", height: "28px", borderRadius: "6px", border: "1px solid #ddd", background: "#f4f6f8", cursor: "pointer", fontSize: "16px", fontWeight: "700" },
  qtdNumero: { fontWeight: "600", minWidth: "20px", textAlign: "center" },
  btnRemover: { background: "#fdecea", border: "none", borderRadius: "6px", color: "#e74c3c", padding: "5px 9px", cursor: "pointer", fontWeight: "700", fontSize: "13px" },
  totalBox: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #f0f0f0", marginTop: "16px", paddingTop: "14px" },
  totalLabel: { fontSize: "16px", fontWeight: "600", color: "#555" },
  totalValor: { fontSize: "24px", fontWeight: "700", color: "#2c3e50" },
  btnFinalizar: { marginTop: "16px", width: "100%", background: "#27ae60", color: "#fff", border: "none", borderRadius: "10px", padding: "14px", fontSize: "16px", fontWeight: "700", cursor: "pointer" },
  erro: { color: "#c0392b", fontSize: "13px", marginTop: "10px" },
  sucessoMsg: { color: "#27ae60", fontSize: "14px", fontWeight: "600", marginTop: "10px" },
};
