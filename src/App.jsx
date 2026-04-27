import React, { useState } from 'react';
import './styles.css';
import Produtos from './pages/Produtos.jsx';
import Clientes from './pages/Clientes.jsx';
import Vendas from './pages/Vendas.jsx';
import Historico from './pages/Historico.jsx';

export default function App(){
 const [page,setPage]=useState('produtos');
 return (
  <div className='layout'>
   <aside className='sidebar'>
    <h1>Bella Gestão</h1>
    <button onClick={()=>setPage('produtos')}>Produtos</button>
    <button onClick={()=>setPage('clientes')}>Clientes</button>
    <button onClick={()=>setPage('vendas')}>Vendas</button>
    <button onClick={()=>setPage('historico')}>Histórico</button>
   </aside>
   <main className='content'>
    {page==='produtos' && <Produtos />}
    {page==='clientes' && <Clientes />}
    {page==='vendas' && <Vendas />}
    {page==='historico' && <Historico />}
   </main>
  </div>
 )
}
