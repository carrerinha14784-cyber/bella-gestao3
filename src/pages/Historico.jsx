import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient.js";

const STATUS_CONFIG = {
  Pago:           { cor: "#27ae60", fundo: "#eafaf1", label: "✅ Pago"         },
  Fiado:          { cor: "#e74c3c", fundo: "#fdecea", label: "📋 Fiado"        },
  "Pago Parcial": { cor: "#e67e22", fundo: "#fef5ec", label: "⚠️ Pago Parcial" },
};

const ICONE_PAGAMENTO = {
  "Dinheiro":          "💵",
  "Cartão de Crédito": "💳",
  "Cartão de Débito":  "💳",
  "Pix":               "📱",
  "Fiado":             "📋",
};

export default function Historico() {
  const [vendas, setVendas]               = useState([]);
  const [busca, setBusca]                 = useState("");
  const [filtroStatus, setFiltroStatus]   = useState("Todos");
  const [expandido, setExpandido]         = useState(null);
  const [modalId, setModalId]             = useState(null);
  const [valorRecebido, setValorRecebido] = useState("");
  const [dataPagamento, setDataPagamento] = useState("");
  const [obs, setObs]                     = useState("");
  const [erroModal, setErroModal]         = useState("");
  const [carregando, setCarregando]       = useState(true);

  useEffect(() => {
    carregarVendas();
  }, []);

  async function carregarVendas() {
    setCarregando(true);
    const { data, error } = await supabase
      .from("vendas")
      .select("*")
      .order("criado_em", { ascending: false });
    if (!error) setVendas(data || []);
    setCarregando(false);
  }

  const vendasFiltradas = vendas.filter((v) => {
    const buscaOk  = v.cliente.toLowerCase().includes(busca.toLowerCase());
    const statusOk = filtroStatus === "Todos" || v.status === filtroStatus;
    return buscaOk && statusOk;
  });

  const totalGeral    = vendasFiltradas.reduce((acc, v) => acc + Number(v.total), 0);
  const totalAReceber = vendas
    .filter((v) => v.status === "Fiado" || v.status === "Pago Parcial")
    .reduce((acc, v) => acc + (Number(v.total) - Number(v.valor_recebido || 0)), 0);

  function abrirModal(venda) {
    setModalId(venda.id);
    setValorRecebido("");
    setDataPagamento(new Date().toLocaleDateString("pt-BR"));
    setObs("");
    setErroModal("");
  }

  function fecharModal() {
    setModalId(null);
    setErroModal("");
  }

  async function confirmarPagamento() {
    const recebido = parseFloat(String(valorRecebido).replace(",", "."));
    if (isNaN(recebido) || recebido <= 0) {
      setErroModal("Informe um valor recebido válido.");
      return;
    }

    const venda         = vendas.find((v) => v.id === modalId);
    const jaRecebido    = Number(venda.valor_recebido || 0);
    const novoTotal     = jaRecebido + recebido;
    const saldoRestante = Number(venda.total) - novoTotal;

    if (recebido > Number(venda.total) - jaRecebido) {
      setErroModal(`Valor maior que o saldo restante (R$ ${(Number(venda.total) - jaRecebido).toFixed(2).replace(".", ",")}).`);
      return;
    }

    const novoStatus = saldoRestante <= 0.001 ? "Pago" : "Pago Parcial";

    const { error } = await supabase
      .from("vendas")
      .update({
        status:          novoStatus,
        valor_recebido:  novoTotal,
        data_pagamento:  novoStatus === "Pago" ? dataPagamento : venda.data_pagamento,
        obs_pagamento:   obs
          ? (venda.obs_pagamento ? venda.obs_pagamento + " | " : "") + obs
          : venda.obs_pagamento,
      })
      .eq("id", modalId);

    if (error) { setErroModal("Erro ao salvar pagamento."); return; }

    await carregarVendas();
    fecharModal();
  }

  function toggleExpandir(id) {
    setExpandido((prev) => (prev === id ? null : id));
  }

  function formatarData(dataISO) {
    if (!dataISO) return "—";
    return new Date(dataISO).toLocaleString("pt-BR");
  }

  const vendaModal = vendas.find((v) => v.id === modalId);

  return (
    <div style={estilos.pagina}>
      <h1 style={estilos.titulo}>📊 Histórico de Vendas</h1>

      {/* Cards resumo */}
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
              R$ {totalAReceber.toFixed(2).replace(".", ",")}
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
          <button style={estilos.btnLimpar} onClick={() => setBusca("")}>✕ Limpar</button>
        )}
      </div>

      {/* Lista */}
      {carregando ? (
        <div style={estilos.vazio}><p style={{ color: "#888" }}>Carregando...</p></div>
      ) : vendasFiltradas.length === 0 ? (
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
            const aberto = expandido === venda.id;
            const cfg    = STATUS_CONFIG[venda.status] || STATUS_CONFIG["Pago"];
            const eFiado = venda.status === "Fiado" || venda.status === "Pago Parcial";

            return (
              <div key={venda.id} style={{ ...estilos.vendaCard, borderLeft: `4px solid ${cfg.cor}` }}>
                <div style={estilos.vendaCabecalho}>
                  <div style={{ ...estilos.vendaInfo, cursor: "pointer", flex: 1 }} onClick={() => toggleExpandir(venda.id)}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span style={estilos.vendaCliente}>{venda.cliente}</span>
                      <span style={{ ...estilos.badgeStatus, color: cfg.cor, background: cfg.fundo }}>
                        {cfg.label}
                      </span>
                    </div>
                    <span style={estilos.vendaData}>
                      🗓 {formatarData(venda.criado_em)}
                      {venda.data_pagamento && venda.status === "Pago" && (
                        <span style={{ marginLeft: "10px", color: "#27ae60" }}>
                          · Pago em {venda.data_pagamento}
                        </span>
                      )}
                    </span>
                  </div>

                  <div style={estilos.vendaDireita}>
                    <span style={estilos.vendaPagamento}>
                      {ICONE_PAGAMENTO[venda.pagamento] || "💳"} {venda.pagamento}
                    </span>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ ...estilos.vendaTotal, color: cfg.cor }}>
                        R$ {Number(venda.total).toFixed(2).replace(".", ",")}
                      </span>
                      {eFiado && (
                        <div style={{ fontSize: "12px", color: "#e74c3c", marginTop: "2px" }}>
                          Saldo: R$ {(Number(venda.total) - Number(venda.valor_recebido || 0)).toFixed(2).replace(".", ",")}
                        </div>
                      )}
                    </div>
                    {eFiado && (
                      <button style={estilos.btnReceber} onClick={(e) => { e.stopPropagation(); abrirModal(venda); }}>
                        💰 Receber
                      </button>
                    )}
                    <span style={{ ...estilos.vendaToggle, cursor: "pointer" }} onClick={() => toggleExpandir(venda.id)}>
                      {aberto ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

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
                        {(venda.itens || []).map((item, idx) => (
                          <tr key={idx} style={estilos.tr}>
                            <td style={estilos.td}>{item.nome}</td>
                            <td style={estilos.td}>{item.quantidade}</td>
                            <td style={estilos.td}>R$ {Number(item.valor).toFixed(2).replace(".", ",")}</td>
                            <td style={{ ...estilos.td, fontWeight: "600", color: "#2c3e50" }}>
                              R$ {Number(item.subtotal).toFixed(2).replace(".", ",")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={estilos.totalLinha}>
                      <span style={{ color: "#555", fontSize: "14px" }}>
                        {(venda.itens || []).reduce((a, i) => a + i.quantidade, 0)} item(s)
                      </span>
                      <span style={estilos.totalDestaque}>
                        Total: R$ {Number(venda.total).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    {venda.obs_pagamento && (
                      <p style={estilos.obsPagamento}>📝 {venda.obs_pagamento}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Receber */}
      {modalId && vendaModal && (
        <div style={estilos.modalOverlay} onClick={fecharModal}>
          <div style={estilos.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={estilos.modalTitulo}>💰 Receber Pagamento</h2>
            <p style={estilos.modalCliente}>Cliente: <strong>{vendaModal.cliente}</strong></p>

            <div style={estilos.resumoModal}>
              <div>
                <span style={estilos.resumoLabel}>Total da venda</span>
                <span style={estilos.resumoValor}>R$ {Number(vendaModal.total).toFixed(2).replace(".", ",")}</span>
              </div>
              <div>
                <span style={estilos.resumoLabel}>Já recebido</span>
                <span style={{ ...estilos.resumoValor, color: "#27ae60" }}>
                  R$ {Number(vendaModal.valor_recebido || 0).toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div>
                <span style={estilos.resumoLabel}>Saldo restante</span>
                <span style={{ ...estilos.resumoValor, color: "#e74c3c" }}>
                  R$ {(Number(vendaModal.total) - Number(vendaModal.valor_recebido || 0)).toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>

            <div style={estilos.modalCampo}>
              <label style={estilos.label}>Valor Recebido Agora (R$) *</label>
              <input
                style={estilos.inputModal}
                value={valorRecebido}
                onChange={(e) => { setValorRecebido(e.target.value); setErroModal(""); }}
                placeholder="Ex: 100.00"
                type="number"
                min="0"
                step="0.01"
              />
            </div>

            <div style={estilos.modalCampo}>
              <label style={estilos.label}>Data do Pagamento</label>
              <input
                style={estilos.inputModal}
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                placeholder="DD/MM/AAAA"
              />
            </div>

            <div style={estilos.modalCampo}>
              <label style={estilos.label}>Observação (opcional)</label>
              <input
                style={estilos.inputModal}
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                placeholder="Ex: Pagou R$50 em dinheiro..."
              />
            </div>

            {erroModal && <p style={estilos.erroModal}>{erroModal}</p>}

            <div style={estilos.modalBotoes}>
              <button style={estilos.btnConfirmar} onClick={confirmarPagamento}>✅ Confirmar</button>
              <button style={estilos.btnCancelarModal} onClick={fecharModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const estilos = {
  pagina: { padding: "24px", maxWidth: "1000px", margin: "0 auto", fontFamily: "'Segoe UI', sans-serif" },
  titulo: { fontSize: "28px", fontWeight: "700", color: "#2c3e50", marginBottom: "20px" },
  gridCards: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" },
  card: { background: "#fff", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: "16px", borderLeft: "4px solid #2c3e50" },
  cardIcone: { fontSize: "28px" },
  cardLabel: { fontSize: "12px", color: "#888", margin: "0 0 4px 0", fontWeight: "500" },
  cardValor: { fontSize: "22px", fontWeight: "700", color: "#2c3e50", margin: 0 },
  barraFiltros: { display: "flex", gap: "10px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" },
  inputBusca: { flex: 1, minWidth: "200px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none", fontFamily: "'Segoe UI', sans-serif" },
  filtroStatus: { display: "flex", gap: "6px", flexWrap: "wrap" },
  btnFiltro: { background: "#ecf0f1", border: "1px solid #ddd", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", cursor: "pointer", color: "#555" },
  btnFiltroAtivo: { background: "#2c3e50", border: "1px solid #2c3e50", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", cursor: "pointer", color: "#fff", fontWeight: "600" },
  btnLimpar: { background: "#ecf0f1", border: "none", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", cursor: "pointer", color: "#555", whiteSpace: "nowrap" },
  vazio: { textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" },
  listaVendas: { display: "flex", flexDirection: "column", gap: "12px" },
  vendaCard: { background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", overflow: "hidden" },
  vendaCabecalho: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", flexWrap: "wrap", gap: "10px" },
  vendaInfo: { display: "flex", flexDirection: "column", gap: "4px" },
  vendaCliente: { fontSize: "15px", fontWeight: "700", color: "#2c3e50" },
  vendaData: { fontSize: "12px", color: "#999" },
  badgeStatus: { fontSize: "12px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" },
  vendaDireita: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" },
  vendaPagamento: { fontSize: "13px", color: "#666", background: "#f4f6f8", padding: "4px 10px", borderRadius: "6px" },
  vendaTotal: { fontSize: "17px", fontWeight: "700" },
  vendaToggle: { fontSize: "13px", color: "#aaa" },
  btnReceber: { background: "#27ae60", color: "#fff", border: "none", borderRadius: "8px", padding: "7px 14px", fontSize: "13px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" },
  vendaItens: { borderTop: "1px solid #f0f0f0", padding: "16px 20px", background: "#fafafa" },
  tabela: { width: "100%", borderCollapse: "collapse", fontSize: "14px", marginBottom: "12px" },
  th: { background: "#f0f2f4", padding: "10px 12px", textAlign: "left", fontWeight: "600", color: "#444", borderBottom: "2px solid #e0e0e0" },
  tr: { borderBottom: "1px solid #eee" },
  td: { padding: "9px 12px", color: "#333", verticalAlign: "middle" },
  totalLinha: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid #e8e8e8" },
  totalDestaque: { fontSize: "15px", fontWeight: "700", color: "#2c3e50" },
  obsPagamento: { marginTop: "10px", fontSize: "13px", color: "#666", fontStyle: "italic" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "420px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" },
  modalTitulo: { fontSize: "20px", fontWeight: "700", color: "#2c3e50", marginBottom: "8px" },
  modalCliente: { fontSize: "14px", color: "#555", marginBottom: "16px" },
  resumoModal: { display: "flex", flexDirection: "column", gap: "6px", background: "#f8f9fa", borderRadius: "10px", padding: "14px 16px", marginBottom: "18px" },
  resumoLabel: { fontSize: "12px", color: "#888", display: "block" },
  resumoValor: { fontSize: "16px", fontWeight: "700", color: "#2c3e50" },
  modalCampo: { marginBottom: "16px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#555", display: "block", marginBottom: "6px" },
  inputModal: { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "'Segoe UI', sans-serif" },
  erroModal: { color: "#c0392b", fontSize: "13px", marginBottom: "8px", fontWeight: "500" },
  modalBotoes: { display: "flex", gap: "10px", marginTop: "20px" },
  btnConfirmar: { flex: 1, background: "#27ae60", color: "#fff", border: "none", borderRadius: "8px", padding: "11px", fontSize: "14px", fontWeight: "700", cursor: "pointer" },
  btnCancelarModal: { flex: 1, background: "#ecf0f1", color: "#555", border: "none", borderRadius: "8px", padding: "11px", fontSize: "14px", cursor: "pointer" },
};
