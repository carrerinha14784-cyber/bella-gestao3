import { useState, useEffect } from "react";

const STORAGE_VENDAS = "bella_vendas";

const STATUS_CONFIG = {
  Pago:          { cor: "#27ae60", fundo: "#eafaf1", label: "✅ Pago"          },
  Fiado:         { cor: "#e74c3c", fundo: "#fdecea", label: "📋 Fiado"         },
  "Pago Parcial":{ cor: "#e67e22", fundo: "#fef5ec", label: "⚠️ Pago Parcial"  },
};

const ICONE_PAGAMENTO = {
  "Dinheiro":         "💵",
  "Cartão de Crédito":"💳",
  "Cartão de Débito": "💳",
  "Pix":              "📱",
  "Fiado":            "📋",
};

export default function Historico() {
  const [vendas, setVendas]       = useState([]);
  const [busca, setBusca]         = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [expandido, setExpandido] = useState(null);
  const [modalId, setModalId]     = useState(null);
  const [novoStatus, setNovoStatus]     = useState("Pago");
  const [dataPagamento, setDataPagamento] = useState("");
  const [obs, setObs]             = useState("");

  useEffect(() => {
    const salvas = localStorage.getItem(STORAGE_VENDAS);
    if (salvas) setVendas(JSON.parse(salvas));
  }, []);

  // vendas com status legado (sem campo status) assumem "Pago"
  const vendasNormalizadas = vendas.map((v) => ({
    ...v,
    status: v.status || (v.pagamento === "Fiado" ? "Fiado" : "Pago"),
  }));

  const vendasFiltradas = vendasNormalizadas.filter((v) => {
    const buscaOk = v.cliente.toLowerCase().includes(busca.toLowerCase());
    const statusOk = filtroStatus === "Todos" || v.status === filtroStatus;
    return buscaOk && statusOk;
  });

  const totalGeral     = vendasFiltradas.reduce((acc, v) => acc + Number(v.total), 0);
  const totalFiado     = vendasNormalizadas
    .filter((v) => v.status === "Fiado" || v.status === "Pago Parcial")
    .reduce((acc, v) => acc + Number(v.total), 0);

  function salvarVendas(lista) {
    localStorage.setItem(STORAGE_VENDAS, JSON.stringify(lista));
    setVendas(lista);
  }

  function abrirModal(venda) {
    setModalId(venda.id);
    setNovoStatus("Pago");
    setDataPagamento(new Date().toLocaleDateString("pt-BR"));
    setObs("");
  }

  function fecharModal() {
    setModalId(null);
  }

  function confirmarPagamento() {
    const atualizadas = vendas.map((v) => {
      if (v.id !== modalId) return v;
      return {
        ...v,
        status: novoStatus,
        dataPagamento: dataPagamento,
        obsPagamento: obs,
      };
    });
    salvarVendas(atualizadas);
    fecharModal();
  }

  function toggleExpandir(id) {
    setExpandido((prev) => (prev === id ? null : id));
  }

  const vendaModal = vendasNormalizadas.find((v) => v.id === modalId);

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
            <p style={estilos.cardLabel}>Valor Filtrado</p>
            <p style={{ ...estilos.cardValor, color: "#27ae60" }}>
              R$ {totalGeral.toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>

        <div style={{ ...estilos.card, borderLeft: "4px solid #e74c3c" }}>
          <span style={estilos.cardIcone}>📋</span>
          <div>
            <p style={estilos.cardLabel}>A Receber (Fiado)</p>
            <p style={{ ...estilos.cardValor, color: "#e74c3c" }}>
              R$ {totalFiado.toFixed(2).replace(".", ",")}
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
      </div>

      {/* Filtros */}
      <div style={estilos.barraFiltros}>
        <input
          style={estilos.inputBusca}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="🔍 Buscar por nome do cliente..."
        />

        <div style={estilos.filtroStatus}>
          {["Todos", "Pago", "Fiado", "Pago Parcial"].map((s) => (
            <button
              key={s}
              style={filtroStatus === s ? estilos.btnFiltroAtivo : estilos.btnFiltro}
              onClick={() => setFiltroStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {busca && (
          <button style={estilos.btnLimpar} onClick={() => setBusca("")}>
            ✕ Limpar
          </button>
        )}
      </div>

      {/* Lista */}
      {vendasFiltradas.length === 0 ? (
        <div style={estilos.vazio}>
          <p style={{ fontSize: "40px", marginBottom: "12px" }}>🗒️</p>
          <p style={{ color: "#888", fontSize: "15px" }}>
            {busca || filtroStatus !== "Todos"
              ? "Nenhuma venda encontrada para esse filtro."
              : "Nenhuma venda registrada ainda."}
          </p>
        </div>
      ) : (
        <div style={estilos.listaVendas}>
          {vendasFiltradas.map((venda) => {
            const aberto  = expandido === venda.id;
            const cfg     = STATUS_CONFIG[venda.status] || STATUS_CONFIG["Pago"];
            const eFiado  = venda.status === "Fiado" || venda.status === "Pago Parcial";

            return (
              <div
                key={venda.id}
                style={{
                  ...estilos.vendaCard,
                  borderLeft: `4px solid ${cfg.cor}`,
                }}
              >
                {/* Cabeçalho */}
                <div style={estilos.vendaCabecalho}>
                  {/* Lado esquerdo — clicável para expandir */}
                  <div
                    style={{ ...estilos.vendaInfo, cursor: "pointer", flex: 1 }}
                    onClick={() => toggleExpandir(venda.id)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span style={estilos.vendaCliente}>{venda.cliente}</span>
                      <span
                        style={{
                          ...estilos.badgeStatus,
                          color: cfg.cor,
                          background: cfg.fundo,
                        }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <span style={estilos.vendaData}>
                      🗓 {venda.data}
                      {venda.dataPagamento && venda.status === "Pago" && (
                        <span style={{ marginLeft: "10px", color: "#27ae60" }}>
                          · Pago em {venda.dataPagamento}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Lado direito */}
                  <div style={estilos.vendaDireita}>
                    <span style={estilos.vendaPagamento}>
                      {ICONE_PAGAMENTO[venda.pagamento] || "💳"} {venda.pagamento}
                    </span>
                    <span style={{ ...estilos.vendaTotal, color: cfg.cor }}>
                      R$ {Number(venda.total).toFixed(2).replace(".", ",")}
                    </span>

                    {eFiado && (
                      <button
                        style={estilos.btnReceber}
                        onClick={(e) => { e.stopPropagation(); abrirModal(venda); }}
                      >
                        💰 Receber
                      </button>
                    )}

                    <span
                      style={{ ...estilos.vendaToggle, cursor: "pointer" }}
                      onClick={() => toggleExpandir(venda.id)}
                    >
                      {aberto ? "▲" : "▼"}
                    </span>
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

                    {venda.obsPagamento && (
                      <p style={estilos.obsPagamento}>📝 {venda.obsPagamento}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Receber Pagamento */}
      {modalId && vendaModal && (
        <div style={estilos.modalOverlay} onClick={fecharModal}>
          <div style={estilos.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={estilos.modalTitulo}>💰 Receber Pagamento</h2>
            <p style={estilos.modalCliente}>Cliente: <strong>{vendaModal.cliente}</strong></p>
            <p style={estilos.modalValor}>
              Valor: <strong>R$ {Number(vendaModal.total).toFixed(2).replace(".", ",")}</strong>
            </p>

            <div style={estilos.modalCampo}>
              <label style={estilos.label}>Novo Status</label>
              <div style={estilos.statusOpcoes}>
                {["Pago", "Pago Parcial"].map((s) => (
                  <button
                    key={s}
                    style={novoStatus === s ? estilos.btnStatusAtivo : estilos.btnStatus}
                    onClick={() => setNovoStatus(s)}
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </div>

            <div style={estilos.modalCampo}>
              <label style={estilos.label}>Data do Pagamento</label>
              <input
                style={estilos.input}
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                placeholder="DD/MM/AAAA"
              />
            </div>

            <div style={estilos.modalCampo}>
              <label style={estilos.label}>Observação (opcional)</label>
              <input
                style={estilos.input}
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                placeholder="Ex: Pagou R$50 em dinheiro..."
              />
            </div>

            <div style={estilos.modalBotoes}>
              <button style={estilos.btnConfirmar} onClick={confirmarPagamento}>
                ✅ Confirmar
              </button>
              <button style={estilos.btnCancelarModal} onClick={fecharModal}>
                Cancelar
              </button>
            </div>
          </div>
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
  barraFiltros: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  inputBusca: {
    flex: 1,
    minWidth: "200px",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    fontFamily: "'Segoe UI', sans-serif",
  },
  filtroStatus: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  btnFiltro: {
    background: "#ecf0f1",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "13px",
    cursor: "pointer",
    color: "#555",
  },
  btnFiltroAtivo: {
    background: "#2c3e50",
    border: "1px solid #2c3e50",
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "13px",
    cursor: "pointer",
    color: "#fff",
    fontWeight: "600",
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
  badgeStatus: {
    fontSize: "12px",
    fontWeight: "600",
    padding: "3px 10px",
    borderRadius: "20px",
  },
  vendaDireita: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
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
  },
  vendaToggle: {
    fontSize: "13px",
    color: "#aaa",
  },
  btnReceber: {
    background: "#27ae60",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "7px 14px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
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
  obsPagamento: {
    marginTop: "10px",
    fontSize: "13px",
    color: "#666",
    fontStyle: "italic",
  },
  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    borderRadius: "16px",
    padding: "28px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
  },
  modalTitulo: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: "8px",
  },
  modalCliente: { fontSize: "14px", color: "#555", marginBottom: "4px" },
  modalValor: { fontSize: "15px", color: "#27ae60", marginBottom: "20px" },
  modalCampo: { marginBottom: "16px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#555", display: "block", marginBottom: "6px" },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'Segoe UI', sans-serif",
  },
  statusOpcoes: { display: "flex", gap: "8px" },
  btnStatus: {
    flex: 1,
    background: "#ecf0f1",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "9px 12px",
    fontSize: "13px",
    cursor: "pointer",
    color: "#555",
  },
  btnStatusAtivo: {
    flex: 1,
    background: "#2c3e50",
    border: "1px solid #2c3e50",
    borderRadius: "8px",
    padding: "9px 12px",
    fontSize: "13px",
    cursor: "pointer",
    color: "#fff",
    fontWeight: "600",
  },
  modalBotoes: { display: "flex", gap: "10px", marginTop: "20px" },
  btnConfirmar: {
    flex: 1,
    background: "#27ae60",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "11px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },
  btnCancelarModal: {
    flex: 1,
    background: "#ecf0f1",
    color: "#555",
    border: "none",
    borderRadius: "8px",
    padding: "11px",
    fontSize: "14px",
    cursor: "pointer",
  },
};
