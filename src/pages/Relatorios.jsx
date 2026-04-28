import { useState, useEffect, useRef } from "react";

const STORAGE_VENDAS = "bella_vendas";

const MESES = [
"Janeiro","Fevereiro","Março","Abril","Maio","Junho",
"Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

function fmt(valor) {
return Number(valor || 0).toFixed(2).replace(".", ",");
}

function obterStatus(venda) {
if (venda.status) return venda.status;

if (venda.pagamento === "Fiado") return "Fiado";

return "Pago";
}

export default function Relatorios() {
const [vendas, setVendas] = useState([]);
const [busca, setBusca] = useState("");
const printRef = useRef();

useEffect(() => {
const dados = JSON.parse(localStorage.getItem(STORAGE_VENDAS) || "[]");
setVendas(dados);
}, []);

const vendasFiltradas = vendas.filter((v) =>
(v.cliente || "").toLowerCase().includes(busca.toLowerCase())
);

const totalBruto = vendasFiltradas.reduce(
(acc, v) => acc + Number(v.total || 0),
0
);

const fiadoPendente = vendasFiltradas
.filter((v) => {
const status = obterStatus(v);
return status === "Fiado" || status === "Pago Parcial";
})
.reduce(
(acc, v) =>
acc + (Number(v.total || 0) - Number(v.valorRecebido || 0)),
0
);

const qtdVendas = vendasFiltradas.length;

function exportarPDF() {
const conteudo = printRef.current.innerHTML;
const janela = window.open("", "_blank");

```
janela.document.write(`
  <html>
    <head>
      <title>Relatório Bella Gestão</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        table { width:100%; border-collapse: collapse; }
        th, td { border:1px solid #ccc; padding:8px; }
        th { background:#eee; }
      </style>
    </head>
    <body>${conteudo}</body>
  </html>
`);

janela.document.close();
janela.print();
```

}

return (
<div style={{ padding: "24px" }}>
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}> <h1>📋 Relatórios</h1> <button onClick={exportarPDF}>⬇ Exportar PDF</button> </div>

```
  <input
    placeholder="Buscar cliente..."
    value={busca}
    onChange={(e) => setBusca(e.target.value)}
    style={{
      padding: "10px",
      width: "100%",
      marginBottom: "20px",
      borderRadius: "8px",
      border: "1px solid #ccc"
    }}
  />

  <div ref={printRef}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "20px" }}>
      <Card titulo="Vendas" valor={qtdVendas} />
      <Card titulo="Total Bruto" valor={`R$ ${fmt(totalBruto)}`} />
      <Card titulo="Fiado Pendente" valor={`R$ ${fmt(fiadoPendente)}`} />
    </div>

    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Cliente</th>
          <th>Pagamento</th>
          <th>Status</th>
          <th>Total</th>
        </tr>
      </thead>

      <tbody>
        {vendasFiltradas.map((v) => (
          <tr key={v.id}>
            <td>{v.data}</td>
            <td>{v.cliente}</td>
            <td>{v.pagamento}</td>
            <td>{obterStatus(v)}</td>
            <td>R$ {fmt(v.total)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

);
}

function Card({ titulo, valor }) {
return (
<div
style={{
background: "#fff",
border: "1px solid #eee",
borderRadius: "10px",
padding: "16px"
}}
>
<p style={{ fontSize: "12px", color: "#777" }}>{titulo}</p> <h2>{valor}</h2> </div>
);
}
