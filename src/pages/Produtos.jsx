import React, { useEffect, useState } from 'react';

export default function Produtos() {
const [lista, setLista] = useState([]);
const [nome, setNome] = useState('');

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
setLista([...lista, { nome }]);
setNome('');
```

}

return ( <div className="card"> <h2>Produtos</h2>

```
  <input
    placeholder="Nome do produto"
    value={nome}
    onChange={(e) => setNome(e.target.value)}
  />

  <button onClick={adicionar}>Adicionar</button>

  <table style={{ width: '100%', marginTop: '20px' }}>
    <thead>
      <tr>
        <th>Produto</th>
      </tr>
    </thead>

    <tbody>
      {lista.map((item, i) => (
        <tr key={i}>
          <td>{item.nome}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

);
}
