import React, { useEffect, useState } from 'react';

export default function Produtos(){
 const [products,setProducts]=useState([]);
 const [name,setName]=useState('');
 const [category,setCategory]=useState('');
 const [color,setColor]=useState('');
 const [size,setSize]=useState('');
 const [stock,setStock]=useState('');
 const [price,setPrice]=useState('');

 useEffect(()=>setProducts(JSON.parse(localStorage.getItem('products')||'[]')),[]);
 useEffect(()=>localStorage.setItem('products',JSON.stringify(products)),[products]);

 function addProduct(){
  if(!name) return;
  setProducts([...products,{name,category,color,size,stock:+stock||0,price:+price||0}]);
  setName('');setCategory('');setColor('');setSize('');setStock('');setPrice('');
 }

 return (
 <div className='card'>
  <h2>Produtos</h2>
  <input placeholder='Nome' value={name} onChange={e=>setName(e.target.value)} />
  <input placeholder='Categoria' value={category} onChange={e=>setCategory(e.target.value)} />
  <input placeholder='Cor' value={color} onChange={e=>setColor(e.target.value)} />
  <input placeholder='Tamanho' value={size} onChange={e=>setSize(e.target.value)} />
  <input placeholder='Estoque' value={stock} onChange={e=>setStock(e.target.value)} />
  <input placeholder='Valor' value={price} onChange={e=>setPrice(e.target.value)} />
  <button onClick={addProduct}>Adicionar</button>

  <table style={{width:'100%',marginTop:20}}>
   <thead><tr><th>Nome</th><th>Categoria</th><th>Cor</th><th>Tamanho</th><th>Estoque</th><th>Valor</th><th>Status</th></tr></thead>
   <tbody>
   {products.map((p,i)=>(<tr key={i}><td>{p.name}</td><td>{p.category}</td><td>{p.color}</td><td>{p.size}</td><td>{p.stock}</td><td>R$ {p.price}</td><td>{p.stock<=3?'🔴 Baixo':'🟢 Normal'}</td></tr>))}
   </tbody>
  </table>
 </div>
 )
}
