import { useState, useEffect } from "react";

const STORAGE_VENDAS = "bella_vendas";

export default function Historico() {
  const [vendas, setVendas] = useState([]);
  const [busca, setBusca] = useState("");
  const [expandido, setExpandido] = useState(null);

  useEffect(() => {
    const salvas = localStorage.getItem(STORAGE_VENDAS);
    if (salvas) setVendas(JSON.parse(salvas));
  }, []);

  const vendasFiltradas = vendas.filter((v) =>
    v.cliente.toLowerCase().includes(busca.toLowerCase())
  );

  const totalGeral = vendasFiltradas.reduce((acc, v) => acc + Number(v.total), 0);

  function toggleExpandir(id) {
    setExpandido((prev) => (prev === id ? null : id));
  }

  const iconePagamento = {
    "Dinheiro": "💵",
    "Cartão de Crédito": "💳",
    "Cartão de Débito": "💳",
    "Pix": "📱",
    "Fiado": "📋",
  };

  return (
    <div style={estilos.pagina}>
      <h1 style={estilos.titulo}>📊 Histórico de Vendas</h1>

      {/* Cards de resumo */}
      <div style={estilos.gridCards}>
        <div style={estilos.card}>
          <span style={estilos.cardIcone}>🛒</span>
          <div>
            <p style={estilos.cardLabel}>Total de Vendas</p>
            <p style={estilos.cardValor}>{vendasFiltradas.length}</p>
          </div>
        </div>

        <div style={{ ...estilos.card, borderLeft: "4px solid #27ae60" }}>
          <span style={estilos.cardIcone}>💰</span>
          <div>
            <p style={estilos.cardLabel}>Valor Total</p>
            <p style={{ ...estilos.cardValor, color: "#27ae60" }}>
              R$ {totalGeral.toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>

        <div style={{ ...estilos.card, borderLeft: "4px solid #3498db" }}>
          <span style={estilos.cardIcone}>👤</span>
          <div>
            <p style={estilos.cardLabel}>Clientes Únicos</p>
            <p style={{ ...estilos.cardValor, color: "#3498db" }}>
              {new Set(vendasFiltradas.map((v) => v.cliente)).size}
            </p>
          </div>
        </div>

        <div style={{ ...estilos.card, borderLeft: "4px solid #e67e22" }}>
          <span style={estilos.cardIcone}>📦</span>
          <div>
            <p style={estilos.cardLabel}>Itens Vendidos</p>
            <p style={{ ...estilos.cardValor, color: "#e67e22" }}>
              {vendasFiltradas.reduce(
                (acc, v) => acc + v.itens.reduce((a, i) => a + i.quantidade, 0),
                0
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div style={estilos.barraBusca}>
        <input
          style={estilos.inputBusca}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="🔍 Buscar por nome do cliente..."
        />
        {busca && (
          <button style={estilos.btnLimpar} onClick={() => setBusca("")}>
            ✕ Limpar
          </button>
        )}
      </div>

      {/* Lista de vendas */}
      {vendasFiltradas.length === 0 ? (
        <div style={estilos.vazio}>
          <p style={{ fontSize: "40px", marginBottom: "12px" }}>🗒️</p>
          <p style={{ color: "#888", fontSize: "15px" }}>
            {busca ? "Nenhuma venda encontrada para esse cliente." : "Nenhuma venda registrada ainda."}
          </p>
        </div>
      ) : (
        <div style={estilos.listaVendas}>
          {vendasFiltradas.map((venda) => {
            const aberto = expandido === venda.id;
            return (
              <div key={venda.id} style={estilos.vendaCard}>
                {/* Cabeçalho da venda */}
                <div
                  style={estilos.vendaCabecalho}
                  onClick={() => toggleExpandir(venda.id)}
                >
                  <div style={estilos.vendaInfo}>
                    <span style={estilos.vendaCliente}>{venda.cliente}</span>
                    <span style={estilos.vendaData}>{venda.data}</span>
                  </div>

                  <div style={estilos.vendaDireita}>
                    <span style={estilos.vendaPagamento}>
                      {iconePagamento[venda.pagamento] || "💳"} {venda.pagamento}
                    </span>
                    <span style={estilos.vendaTotal}>
                      R$ {Number(venda.total).toFixed(2).replace(".", ",")}
                    </span>
                    <span style={estilos.vendaToggle}>{aberto ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Itens expandidos */}
                {aberto && (
                  <div style={estilos.vendaItens}>
                    <table style={estilos.tabela}>
                      <thead>
                        <tr>
                          {["Produto", "Qtd", "Valor Unit.", "Subtotal"].map((h) => (
                            <th key={h} style={estilos.th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {venda.itens.map((item, idx) => (
                          <tr key={idx} style={estilos.tr}>
                            <td style={estilos.td}>{item.nome}</td>
                            <td style={estilos.td}>{item.quantidade}</td>
                            <td style={estilos.td}>
                              R$ {Number(item.valor).toFixed(2).replace(".", ",")}
                            </td>
                            <td style={{ ...estilos.td, fontWeight: "600", color: "#2c3e50" }}>
                              R$ {Number(item.subtotal).toFixed(2).replace(".", ",")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={estilos.totalLinha}>
                      <span style={{ color: "#555", fontSize: "14px" }}>
                        {venda.itens.reduce((a, i) => a + i.quantidade, 0)} item(s)
                      </span>
                      <span style={estilos.totalDestaque}>
                        Total: R$ {Number(venda.total).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const estilos = {
  pagina: {
    padding: "24px",
    maxWidth: "1000px",
    margin: "0 auto",
    fontFamily: "'Segoe UI', sans-serif",
  },
  titulo: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: "20px",
  },
  gridCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "18px 20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    borderLeft: "4px solid #2c3e50",
  },
  cardIcone: { fontSize: "28px" },
  cardLabel: { fontSize: "12px", color: "#888", margin: "0 0 4px 0", fontWeight: "500" },
  cardValor: { fontSize: "22px", fontWeight: "700", color: "#2c3e50", margin: 0 },
  barraBusca: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "20px",
  },
  inputBusca: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    fontFamily: "'Segoe UI', sans-serif",
  },
  btnLimpar: {
    background: "#ecf0f1",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "13px",
    cursor: "pointer",
    color: "#555",
    whiteSpace: "nowrap",
  },
  vazio: {
    textAlign: "center",
    padding: "60px 24px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  },
  listaVendas: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  vendaCard: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    overflow: "hidden",
  },
  vendaCabecalho: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    cursor: "pointer",
    flexWrap: "wrap",
    gap: "10px",
  },
  vendaInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  vendaCliente: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#2c3e50",
  },
  vendaData: {
    fontSize: "12px",
    color: "#999",
  },
  vendaDireita: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  vendaPagamento: {
    fontSize: "13px",
    color: "#666",
    background: "#f4f6f8",
    padding: "4px 10px",
    borderRadius: "6px",
  },
  vendaTotal: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#27ae60",
  },
  vendaToggle: {
    fontSize: "13px",
    color: "#aaa",
  },
  vendaItens: {
    borderTop: "1px solid #f0f0f0",
    padding: "16px 20px",
    background: "#fafafa",
  },
  tabela: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
    marginBottom: "12px",
  },
  th: {
    background: "#f0f2f4",
    padding: "10px 12px",
    textAlign: "left",
    fontWeight: "600",
    color: "#444",
    borderBottom: "2px solid #e0e0e0",
  },
  tr: { borderBottom: "1px solid #eee" },
  td: { padding: "9px 12px", color: "#333", verticalAlign: "middle" },
  totalLinha: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "10px",
    borderTop: "1px solid #e8e8e8",
  },
  totalDestaque: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#2c3e50",
  },
};
