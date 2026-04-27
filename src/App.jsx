import React, { useEffect, useMemo, useState } from 'react';
import './styles.css';

export default function App(){
 const [page,setPage]=useState('dashboard');
 const [products,setProducts]=useState([]);
 const [clients,setClients]=useState([]);
 const [sales,setSales]=useState([]);
 const [cart,setCart]=useState([]);
 const [pName,setPName]=useState('');
 const [pQty,setPQty]=useState('');
 const [pPrice,setPPrice]=useState('');
 const [cName,setCName]=useState('');
 const [cPhone,setCPhone]=useState('');
 const [search,setSearch]=useState('');
 const [qty,setQty]=useState('1');
 const [client,setClient]=useState('Cliente Balcão');

 useEffect(()=>{
  setProducts(JSON.parse(localStorage.getItem('products')||'[]'));
  setClients(JSON.parse(localStorage.getItem('clients')||'[]'));
  setSales(JSON.parse(localStorage.getItem('sales')||'[]'));
 },[]);
 useEffect(()=>localStorage.setItem('products',JSON.stringify(products)),[products]);
 useEffect(()=>localStorage.setItem('clients',JSON.stringify(clients)),[clients]);
 useEffect(()=>localStorage.setItem('sales',JSON.stringify(sales)),[sales]);

 const filtered = useMemo(()=>products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())),[search,products]);
 const total = cart.reduce((s,i)=>s+i.qty*i.price,0);

 function addProduct(){if(!pName)return;setProducts([...products,{name:pName,qty:+pQty||0,price:+pPrice||0}]);setPName('');setPQty('');setPPrice('');}
 function addClient(){if(!cName)return;setClients([...clients,{name:cName,phone:cPhone}]);setCName('');setCPhone('');}
 function addCart(prod){const q=+qty||1;if(prod.qty<q)return alert('Sem estoque');setCart([...cart,{name:prod.name,qty:q,price:prod.price}]);setSearch('');setQty('1');}
 function removeCart(i){setCart(cart.filter((_,x)=>x!==i));}
 function finishSale(){if(!cart.length)return;let updated=[...products];cart.forEach(c=>{const it=updated.find(p=>p.name===c.name);if(it)it.qty-=c.qty;});setProducts(updated);setSales([{date:new Date().toLocaleString(),client,total,items:cart},...sales]);setCart([]);alert('Venda finalizada com sucesso');setPage('historico');}

 return <div className='layout'>
 <aside className='sidebar'>
 <h1>Bella Gestão</h1>
 <button onClick={()=>setPage('dashboard')}>Dashboard</button>
 <button onClick={()=>setPage('produtos')}>Produtos</button>
 <button onClick={()=>setPage('clientes')}>Clientes</button>
 <button onClick={()=>setPage('vendas')}>Vendas</button>
 <button onClick={()=>setPage('historico')}>Histórico</button>
 </aside>
 <main className='content'>
 {page==='dashboard' && <div className='card'><h2>Dashboard</h2><p>Produtos: {products.length}</p><p>Clientes: {clients.length}</p><p>Vendas: {sales.length}</p></div>}
 {page==='produtos' && <div className='card'><h2>Produtos</h2><input placeholder='Nome' value={pName} onChange={e=>setPName(e.target.value)}/><input placeholder='Qtd' value={pQty} onChange={e=>setPQty(e.target.value)}/><input placeholder='Preço' value={pPrice} onChange={e=>setPPrice(e.target.value)}/><button onClick={addProduct}>Adicionar</button>{products.map((p,i)=><p key={i}>{p.name} | Est {p.qty} | R$ {p.price}</p>)}</div>}
 {page==='clientes' && <div className='card'><h2>Clientes</h2><input placeholder='Nome' value={cName} onChange={e=>setCName(e.target.value)}/><input placeholder='Telefone' value={cPhone} onChange={e=>setCPhone(e.target.value)}/><button onClick={addClient}>Adicionar</button>{clients.map((c,i)=><p key={i}>{c.name} - {c.phone}</p>)}</div>}
 {page==='vendas' && <div className='card'><h2>Vendas</h2><select value={client} onChange={e=>setClient(e.target.value)}><option>Cliente Balcão</option>{clients.map((c,i)=><option key={i}>{c.name}</option>)}</select><input placeholder='Buscar produto' value={search} onChange={e=>setSearch(e.target.value)}/><input placeholder='Qtd' value={qty} onChange={e=>setQty(e.target.value)}/>{filtered.map((p,i)=><button key={i} onClick={()=>addCart(p)}>{p.name} | Est {p.qty} | R$ {p.price}</button>)}<hr/>{cart.map((c,i)=><p key={i}>{c.name} x{c.qty} - R$ {c.qty*c.price} <button onClick={()=>removeCart(i)}>X</button></p>)}<p>Total: R$ {total}</p><button onClick={finishSale}>Finalizar Venda</button></div>}
 {page==='historico' && <div className='card'><h2>Histórico</h2>{sales.length===0?<p>Nenhuma venda.</p>:sales.map((s,i)=><div key={i}><p>{s.date}</p><p>Cliente: {s.client}</p>{s.items.map((it,j)=><p key={j}>{it.name} x{it.qty}</p>)}<p>Total: R$ {s.total}</p><hr/></div>)}</div>}
 </main></div>
}
