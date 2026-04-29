import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient.js";

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

function fmt(valor) {
  return Number(valor || 0).toFixed(2).replace(".", ",");
}

export default function Relatorios() {
  const [vendas, setVendas]     = useState([]);
  const [modo, setModo]         = useState("mensal");
  const [mesSel, setMesSel]     = useState(new Date().getMonth());
  const [anoSel, setAnoSel]     = useState(String(new Date().getFullYear()));
  const [carregando, setCarregando] = useState(true);
  const printRef                = useRef();

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

  // Anos disponíveis a partir das vendas reais
  const anos = [...new Set(
    vendas.map((v) => new Date(v.criado_em).getFullYear().toString())
  )].sort((a, b) => b - a);
  if (anos.length === 0) anos.push(String(new Date().getFullYear()));

  // Filtro de período
  const vendasPeriodo = vendas.filter((v) => {
    const data = new Date(v.criado_em);
    const mes  = data.getMonth();
    const ano  = String(data.getFullYear());
    if (modo === "mensal") return mes === mesSel && ano === anoSel;
    return ano === anoSel;
  });

  // Totalizadores
  const totalBruto   = vendasPeriodo.reduce((a, v) => a + Number(v.total), 0);
  const qtdVendas    = vendasPeriodo.length;
  const ticketMedio  = qtdVendas > 0 ? totalBruto / qtdVendas : 0;

  const fiadoRecebido = vendasPeriodo
    .filter((v) => v.status === "Pago" && v.pagamento === "Fiado")
    .reduce((a, v) => a + Number(v.total), 0);

  const fiadoPendente = vendasPeriodo
    .filter((v) => v.status === "Fiado" || v.status === "Pago Parcial")
    .reduce((a, v) => a + (Number(v.total) - Number(v.valor_recebido || 0)), 0);

  const porPagamento = vendasPeriodo.reduce((acc, v) => {
    const chave = v.pagamento || "Não informado";
    acc[chave] = (acc[chave] || 0) + Number(v.total);
    return acc;
  }, {});

  // Resumo mensal (modo anual)
  const resumoMensal = MESES.map((nomeMes, idx) => {
    const vMes  = vendas.filter((v) => {
      const d = new Date(v.criado_em);
      return d.getMonth() === idx && String(d.getFullYear()) === anoSel;
    });
    return { nomeMes, total: vMes.reduce((a, v) => a + Number(v.total), 0), qtd: vMes.length };
  });

  // Exportar PDF
  function exportarPDF() {
    const titulo = modo === "mensal"
      ? `Relatório ${MESES[mesSel]} ${anoSel}`
      : `Relatório Anual ${anoSel}`;

    const janela = window.open("", "_blank");
    janela.document.write(`
      <!DOCTYPE html><html lang="pt-BR">
      <head><meta charset="UTF-8"/><title>${titulo}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #222; padding: 32px; }
        h1 { font-size: 22px; color: #2c3e50; margin-bottom: 4px; }
        .sub { color: #888; font-size: 12px; margin-bottom: 24px; }
        .aviso { background: #fff8e1; border: 1px solid #ffc107; border-radius: 6px; padding: 8px 14px; font-size: 11px; color: #856404; margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 24px; }
        .card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px 16px; }
        .card-label { font-size: 11px; color: #888; margin-bottom: 4px; }
        .card-valor { font-size: 18px; font-weight: 700; color: #2c3e50; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
        th { background: #f4f6f8; padding: 8px 10px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600; }
        td { padding: 7px 10px; border-bottom: 1px solid #f0f0f0; }
        .section-title { font-size: 14px; font-weight: 700; color: #2c3e50; margin: 20px 0 10px; border-bottom: 2px solid #e0e0e0; padding-bottom: 6px; }
        .rodape { margin-top: 32px; border-top: 1px solid #ddd; padding-top: 12px; font-size: 11px; color: #aaa; }
        @media print { body { padding: 16px; } }
      </style></head>
      <body>${printRef.current?.innerHTML || ""}</body></html>
    `);
    janela.document.close();
    janela.focus();
    setTimeout(() => { janela.print(); janela.close(); }, 400);
  }

  const periodoLabel  = modo === "mensal" ? `${MESES[mesSel]} / ${anoSel}` : `Ano ${anoSel}`;
  const dataGeracao   = new Date().toLocaleString("pt-BR");

  return (
    <div style={estilos.pagina}>
      <div style={estilos.cabecalhoTela}>
        <h1 style={estilos.titulo}>📋 Relatórios</h1>
        <button style={estilos.btnExportar} onClick={exportarPDF}>⬇️ Exportar PDF</button>
      </div>

      {/* Controles */}
      <div style={estilos.controles}>
        <div style={estilos.modoOpcoes}>
          {["mensal", "anual"].map((m) => (
            <button key={m} style={modo === m ? estilos.btnModoAtivo : estilos.btnModo} onClick={() => setModo(m)}>
              {m === "mensal" ? "📅 Mensal" : "📆 Anual"}
            </button>
          ))}
        </div>
        {modo === "mensal" && (
          <select style={estilos.select} value={mesSel} onChange={(e) => setMesSel(Number(e.target.value))}>
            {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        )}
        <select style={estilos.select} value={anoSel} onChange={(e) => setAnoSel(e.target.value)}>
          {anos.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>

      {carregando ? (
        <p style={{ color: "#888", textAlign: "center", padding: "40px" }}>Carregando...</p>
      ) : (
        <div ref={printRef}>
          {/* Cabeçalho do relatório */}
          <div style={{ marginBottom: "20px" }}>
            <h2 style={estilos.relatorioTitulo}>Bella Gestão — Relatório {modo === "mensal" ? "Mensal" : "Anual"}</h2>
            <p style={estilos.relatorioSub}>Período: {periodoLabel}</p>
            <p style={estilos.relatorioSub}>Gerado em: {dataGeracao}</p>
          </div>

          <div style={estilos.avisoFiscal}>
            ⚠️ <strong>Documento de uso interno.</strong> Este relatório não possui valor fiscal ou legal. Consulte um contador para declaração de imposto de renda.
          </div>

          {/* Cards */}
          <div style={estilos.gridCards}>
            <CardResumo icone="🛒" label="Nº de Vendas"   valor={qtdVendas}              cor="#3498db" />
            <CardResumo icone="💰" label="Total Bruto"     valor={`R$ ${fmt(totalBruto)}`} cor="#27ae60" />
            <CardResumo icone="🧾" label="Ticket Médio"    valor={`R$ ${fmt(ticketMedio)}`} cor="#8e44ad" />
            <CardResumo icone="📋" label="Fiado Pendente"  valor={`R$ ${fmt(fiadoPendente)}`} cor="#e74c3c" />
          </div>

          {/* Formas de pagamento */}
          <div style={estilos.secao}>
            <h3 style={estilos.secaoTitulo}>💳 Receita por Forma de Pagamento</h3>
            {Object.keys(porPagamento).length === 0 ? (
              <p style={estilos.vazio}>Nenhuma venda no período.</p>
            ) : (
              <table style={estilos.tabela}>
                <thead>
                  <tr>{["Forma de Pagamento","Qtd Vendas","Total (R$)","% do Total"].map((h) => <th key={h} style={estilos.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {Object.entries(porPagamento).sort((a,b) => b[1]-a[1]).map(([forma, total]) => {
                    const qtd = vendasPeriodo.filter((v) => v.pagamento === forma).length;
                    const pct = totalBruto > 0 ? ((total/totalBruto)*100).toFixed(1) : "0.0";
                    return (
                      <tr key={forma} style={estilos.tr}>
                        <td style={estilos.td}>{forma}</td>
                        <td style={estilos.td}>{qtd}</td>
                        <td style={{ ...estilos.td, fontWeight:"600" }}>R$ {fmt(total)}</td>
                        <td style={estilos.td}>
                          <div style={estilos.barraWrap}>
                            <div style={{ ...estilos.barraFill, width:`${pct}%` }}/>
                            <span style={estilos.barraLabel}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ background:"#f4f6f8" }}>
                    <td style={{ ...estilos.td, fontWeight:"700" }} colSpan={2}>Total</td>
                    <td style={{ ...estilos.td, fontWeight:"700" }}>R$ {fmt(totalBruto)}</td>
                    <td style={estilos.td}>100%</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          {/* Fiado */}
          <div style={estilos.secao}>
            <h3 style={estilos.secaoTitulo}>📋 Resumo de Fiado</h3>
            <table style={estilos.tabela}>
              <thead><tr>{["Situação","Valor (R$)"].map((h) => <th key={h} style={estilos.th}>{h}</th>)}</tr></thead>
              <tbody>
                <tr style={estilos.tr}>
                  <td style={estilos.td}>✅ Fiado Recebido (quitado no período)</td>
                  <td style={{ ...estilos.td, color:"#27ae60", fontWeight:"600" }}>R$ {fmt(fiadoRecebido)}</td>
                </tr>
                <tr style={estilos.tr}>
                  <td style={estilos.td}>⏳ Fiado Pendente (saldo a receber)</td>
                  <td style={{ ...estilos.td, color:"#e74c3c", fontWeight:"600" }}>R$ {fmt(fiadoPendente)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Resumo mensal (anual) */}
          {modo === "anual" && (
            <div style={estilos.secao}>
              <h3 style={estilos.secaoTitulo}>📅 Resumo por Mês — {anoSel}</h3>
              <table style={estilos.tabela}>
                <thead><tr>{["Mês","Nº Vendas","Total Bruto (R$)"].map((h) => <th key={h} style={estilos.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {resumoMensal.map(({ nomeMes, total, qtd }) => (
                    <tr key={nomeMes} style={estilos.tr}>
                      <td style={estilos.td}>{nomeMes}</td>
                      <td style={estilos.td}>{qtd}</td>
                      <td style={{ ...estilos.td, fontWeight: qtd > 0 ? "600" : "400", color: qtd > 0 ? "#2c3e50" : "#bbb" }}>
                        {qtd > 0 ? `R$ ${fmt(total)}` : "—"}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background:"#f4f6f8" }}>
                    <td style={{ ...estilos.td, fontWeight:"700" }}>Total</td>
                    <td style={{ ...estilos.td, fontWeight:"700" }}>{qtdVendas}</td>
                    <td style={{ ...estilos.td, fontWeight:"700" }}>R$ {fmt(totalBruto)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Lista de vendas */}
          <div style={estilos.secao}>
            <h3 style={estilos.secaoTitulo}>🧾 Vendas do Período ({vendasPeriodo.length})</h3>
            {vendasPeriodo.length === 0 ? (
              <p style={estilos.vazio}>Nenhuma venda registrada neste período.</p>
            ) : (
              <table style={estilos.tabela}>
                <thead><tr>{["Data","Cliente","Pagamento","Status","Total (R$)"].map((h) => <th key={h} style={estilos.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {vendasPeriodo.map((v) => {
                    const statusCor = { Pago:"#27ae60", Fiado:"#e74c3c", "Pago Parcial":"#e67e22" }[v.status] || "#555";
                    return (
                      <tr key={v.id} style={estilos.tr}>
                        <td style={estilos.td}>{new Date(v.criado_em).toLocaleString("pt-BR")}</td>
                        <td style={{ ...estilos.td, fontWeight:"600" }}>{v.cliente}</td>
                        <td style={estilos.td}>{v.pagamento}</td>
                        <td style={{ ...estilos.td, color: statusCor, fontWeight:"600" }}>{v.status}</td>
                        <td style={{ ...estilos.td, fontWeight:"700" }}>R$ {fmt(v.total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Rodapé */}
          <div style={estilos.rodape}>
            <p>Bella Gestão · Relatório gerado em {dataGeracao}</p>
            <p>Este documento é de uso interno e não substitui documentação fiscal oficial.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CardResumo({ icone, label, valor, cor }) {
  return (
    <div style={{ ...estilos.cardResumo, borderLeft: `4px solid ${cor}` }}>
      <span style={{ fontSize: "26px" }}>{icone}</span>
      <div>
        <p style={{ fontSize: "12px", color: "#888", margin: "0 0 4px 0" }}>{label}</p>
        <p style={{ fontSize: "20px", fontWeight: "700", color: cor, margin: 0 }}>{valor}</p>
      </div>
    </div>
  );
}

const estilos = {
  pagina: { padding: "24px", maxWidth: "1000px", margin: "0 auto", fontFamily: "'Segoe UI', sans-serif" },
  titulo: { fontSize: "28px", fontWeight: "700", color: "#2c3e50" },
  cabecalhoTela: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  btnExportar: { background: "#2c3e50", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 22px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  controles: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "24px", background: "#fff", padding: "14px 18px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" },
  modoOpcoes: { display: "flex", gap: "6px" },
  btnModo: { background: "#ecf0f1", border: "1px solid #ddd", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer", color: "#555" },
  btnModoAtivo: { background: "#2c3e50", border: "1px solid #2c3e50", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", cursor: "pointer", color: "#fff", fontWeight: "600" },
  select: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none", background: "#fff", fontFamily: "'Segoe UI', sans-serif" },
  relatorioTitulo: { fontSize: "20px", fontWeight: "700", color: "#2c3e50", marginBottom: "4px" },
  relatorioSub: { fontSize: "13px", color: "#888", marginBottom: "2px" },
  avisoFiscal: { background: "#fff8e1", border: "1px solid #ffc107", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", color: "#856404", marginBottom: "20px", marginTop: "12px" },
  gridCards: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px", marginBottom: "28px" },
  cardResumo: { background: "#fff", borderRadius: "12px", padding: "16px 18px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: "14px" },
  secao: { background: "#fff", borderRadius: "12px", padding: "20px", marginBottom: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.07)" },
  secaoTitulo: { fontSize: "15px", fontWeight: "700", color: "#2c3e50", marginBottom: "14px", paddingBottom: "8px", borderBottom: "2px solid #f0f0f0" },
  tabela: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
  th: { background: "#f4f6f8", padding: "10px 12px", textAlign: "left", fontWeight: "600", color: "#444", borderBottom: "2px solid #e0e0e0", whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid #f0f0f0" },
  td: { padding: "9px 12px", color: "#333", verticalAlign: "middle" },
  barraWrap: { display: "flex", alignItems: "center", gap: "8px", minWidth: "120px" },
  barraFill: { height: "8px", background: "#3498db", borderRadius: "4px", minWidth: "4px", maxWidth: "100px" },
  barraLabel: { fontSize: "12px", color: "#555", whiteSpace: "nowrap" },
  vazio: { color: "#aaa", fontSize: "14px", padding: "8px 0" },
  rodape: { marginTop: "24px", borderTop: "1px solid #e0e0e0", paddingTop: "12px", fontSize: "12px", color: "#aaa", lineHeight: "1.8" },
};
