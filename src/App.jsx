import React, { useState } from 'react';
import './styles.css';

export default function App() {
const [page, setPage] = useState('produtos');

return ( <div className="layout"> <aside className="sidebar"> <h1>Bella Gestão</h1>

```
    <button onClick={() => setPage('produtos')}>Produtos</button>
    <button onClick={() => setPage('clientes')}>Clientes</button>
    <button onClick={() => setPage('vendas')}>Vendas</button>
    <button onClick={() => setPage('historico')}>Histórico</button>
  </aside>

  <main className="content">
    {page === 'produtos' && <div className="card"><h2>Produtos</h2></div>}
    {page === 'clientes' && <div className="card"><h2>Clientes</h2></div>}
    {page === 'vendas' && <div className="card"><h2>Vendas</h2></div>}
    {page === 'historico' && <div className="card"><h2>Histórico</h2></div>}
  </main>
</div>
```

);
}
