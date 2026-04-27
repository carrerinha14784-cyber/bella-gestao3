import React, { useState } from 'react';
import './styles.css';

export default function App(){
  const [page,setPage]=useState('dashboard');
  return (
    <div className='layout'>
      <aside className='sidebar'>
        <h1>Bella Gestão</h1>
        <button onClick={()=>setPage('dashboard')}>Dashboard</button>
        <button onClick={()=>setPage('produtos')}>Produtos</button>
        <button onClick={()=>setPage('clientes')}>Clientes</button>
        <button onClick={()=>setPage('vendas')}>Vendas</button>
        <button onClick={()=>setPage('historico')}>Histórico</button>
      </aside>
      <main className='content'>
        {page==='dashboard' && <div className='card'><h2>Dashboard</h2><p>Bem-vinda ao Bella Gestão 🌸</p></div>}
        {page==='produtos' && <div className='card'><h2>Produtos</h2><p>Módulo pronto para cadastro.</p></div>}
        {page==='clientes' && <div className='card'><h2>Clientes</h2><p>Módulo pronto para cadastro.</p></div>}
        {page==='vendas' && <div className='card'><h2>Vendas</h2><p>Módulo pronto para vendas.</p></div>}
        {page==='historico' && <div className='card'><h2>Histórico</h2><p>Nenhuma venda ainda.</p></div>}
      </main>
    </div>
  )
}
