import React, { useEffect, useState } from 'react';

export default function Produtos() {
const [lista, setLista] = useState([]);
const [nome, setNome] = useState('');
const [categoria, setCategoria] = useState('');
const [cor, setCor] = useState('');
const [tamanho, setTamanho] = useState('');
const [estoque, setEstoque] = useState('');
const [valor, setValor] = useState('');

useEffect(() => {
const dados = JSON.parse(localStorage.getItem('produtos') || '[]');
setLista(dados);
}, []);

useEffect(() => {
localStorage.setItem('produtos', JSON.stringify(lista));
}, [lista]);

function adicionar() {
if (!nome) return;

```
const novo = {
  nome,
  categoria,
  cor,
  tamanho,
  estoque,
  valor
};

setLista([...lista, novo]);

setNome('');
setCategoria('');
setCor('');
setTamanho('');
setEstoque('');
setValor('');
```

}

return ( <div className="card"> <h2>Produtos</h2>

```
  <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
  <input placeholder="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
  <input placeholder="Cor" value={cor} onChange={(e) => setCor(e.target.value)} />
  <input placeholder="Tamanho" value={tamanho} onChange={(e) => setTamanho(e.target.value)} />
  <input placeholder="Estoque" value={estoque} onChange={(e) => setEstoque(e.target.value)} />
  <input placeholder="Valor" value={valor} onChange={(e) => setValor(e.target.value)} />

  <button onClick={adicionar}>Adicionar</button>

  <table style={{ width: '100%', marginTop: '20px' }}>
    <thead>
      <tr>
        <th>Nome</th>
        <th>Categoria</th>
        <th>Cor</th>
        <th>Tamanho</th>
        <th>Estoque</th>
        <th>Valor</th>
        <th>Status</th>
      </tr>
    </thead>

    <tbody>
      {lista.map((item, i) => (
        <tr key={i}>
          <td>{item.nome}</td>
          <td>{item.categoria}</td>
          <td>{item.cor}</td>
          <td>{item.tamanho}</td>
          <td>{item.estoque}</td>
          <td>R$ {item.valor}</td>
          <td>{Number(item.estoque) <= 3 ? '🔴 Baixo' : '🟢 Normal'}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

);
}
