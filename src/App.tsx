import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Shell } from './components/Shell';
import { BottomNav } from './components/BottomNav';
import { DuelView } from './views/DuelView';
import { DecksView } from './views/DecksView';
import { AlbumView } from './views/AlbumView';
import { TournamentsView } from './views/TournamentsView';
import { ProfileView } from './views/ProfileView';
import { Loader2, RefreshCw } from 'lucide-react';
import './App.css';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('duel');
  const { loadingCards, loadingError, updateCardsDatabase } = useApp();

  // Handle Initial Loading from API/IndexedDB
  if (loadingCards) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at center, #151821 0%, #0b0c10 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textAlign: 'center'
      }}>
        <div style={{
          position: 'relative',
          width: '80px',
          height: '80px',
          marginBottom: '24px'
        }}>
          {/* Animated Gold Ring */}
          <div style={{
            position: 'absolute',
            inset: 0,
            border: '4px solid rgba(212, 175, 55, 0.1)',
            borderRadius: '50%'
          }} />
          <Loader2 
            size={80} 
            style={{ 
              color: 'var(--gold)', 
              animation: 'spin 1.5s linear infinite' 
            }} 
          />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--gold)', letterSpacing: '1px', marginBottom: '8px' }}>
          🔮 TIME TO DUEL
        </h2>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>
          Sincronizando Banco de Dados Oficial
        </h3>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', maxWidth: '300px', lineHeight: '1.5' }}>
          Baixando as informações e imagens oficiais da YGOPRODeck API. Isso ocorre apenas no primeiro acesso para possibilitar o uso offline.
        </p>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at center, #151821 0%, #0b0c10 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 75, 75, 0.1)',
          border: '1px solid var(--red)',
          padding: '20px',
          borderRadius: '12px',
          maxWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--red)' }}>
            ⚠️ Falha na Sincronização
          </h2>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4' }}>
            Ocorreu um erro ao carregar as cartas da API. Certifique-se de estar conectado à internet.
          </p>
          <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.4)', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px', wordBreak: 'break-all' }}>
            Detalhes: {loadingError}
          </span>
          <button 
            className="btn-premium" 
            onClick={updateCardsDatabase}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '12px', 
              padding: '8px 16px',
              marginTop: '4px' 
            }}
          >
            <RefreshCw size={14} /> Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'duel':
        return <DuelView />;
      case 'decks':
        return <DecksView />;
      case 'album':
        return <AlbumView />;
      case 'tournaments':
        return <TournamentsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DuelView />;
    }
  };

  return (
    <Shell>
      <div className="app-content">
        {renderActiveView()}
      </div>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </Shell>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
