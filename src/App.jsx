import React, { useState } from 'react';
import Produtos from './pages/Produtos.jsx';
import Clientes from './pages/Clientes.jsx';
import Vendas from './pages/Vendas.jsx';
import Historico from './pages/Historico.jsx';
import './styles.css';

const abas = [
  { id: 'produtos', label: '📦 Produtos' },
  { id: 'clientes', label: '👥 Clientes' },
  { id: 'vendas',   label: '🛒 Vendas'   },
  { id: 'historico', label: '📊 Histórico' },
];

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState('vendas');

  return (
    <div style={estilos.app}>
      {/* Sidebar */}
      <aside style={estilos.sidebar}>
        <div style={estilos.logo}>
          <span style={estilos.logoTexto}>Bella</span>
          <span style={estilos.logoSub}>Gestão</span>
        </div>

        <nav style={estilos.nav}>
          {abas.map((aba) => (
            <button
              key={aba.id}
              style={abaAtiva === aba.id ? estilos.navItemAtivo : estilos.navItem}
              onClick={() => setAbaAtiva(aba.id)}
            >
              {aba.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Conteúdo principal */}
      <main style={estilos.main}>
        {abaAtiva === 'produtos' && <Produtos />}
        {abaAtiva === 'clientes' && <Clientes />}
        {abaAtiva === 'vendas'   && <Vendas />}
        {abaAtiva === 'historico' && <Historico />}
      </main>
    </div>
  );
}

const estilos = {
  app: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f4f6f8',
    fontFamily: "'Segoe UI', sans-serif",
  },
  sidebar: {
    width: '220px',
    minHeight: '100vh',
    background: '#2c3e50',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
  },
  logo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '36px',
    padding: '0 16px',
  },
  logoTexto: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '1px',
  },
  logoSub: {
    fontSize: '12px',
    color: '#95a5a6',
    letterSpacing: '3px',
    textTransform: 'uppercase',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 12px',
  },
  navItem: {
    background: 'transparent',
    border: 'none',
    color: '#bdc3c7',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'left',
    cursor: 'pointer',
  },
  navItemAtivo: {
    background: '#3d5166',
    border: 'none',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'left',
    cursor: 'pointer',
  },
  main: {
    marginLeft: '220px',
    flex: 1,
    padding: '8px',
    minHeight: '100vh',
  },
};
