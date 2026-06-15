import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Shell } from './components/Shell';
import { BottomNav } from './components/BottomNav';
import { DuelView } from './views/DuelView';
import { DecksView } from './views/DecksView';
import { AlbumView } from './views/AlbumView';
import { TournamentsView } from './views/TournamentsView';
import { ProfileView } from './views/ProfileView';
import { Loader2, RefreshCw, Upload } from 'lucide-react';
import './App.css';

const OnboardingSetup: React.FC = () => {
  const { updateProfile } = useApp();
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('/avatars/yugi.jpg');
  const [theme, setTheme] = useState<'default' | 'dark-magician' | 'blue-eyes'>('default');
  const [showAvatars, setShowAvatars] = useState(false);

  const avatars = [
    { name: 'Yugi', url: '/avatars/yugi.jpg' }, 
    { name: 'Kaiba', url: '/avatars/kaiba.jpg' },
    { name: 'Pegasus', url: '/avatars/pegasus.jpg' },
    { name: 'Joey', url: '/avatars/joye.jpg' },
    { name: 'Mai', url: '/avatars/mai.jpg' },
    { name: 'Marik', url: '/avatars/marik.jpg' },
  ];

  const handleUploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('A imagem é muito grande! Escolha uma de até 3MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        setAvatarUrl(base64Url);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStart = () => {
    if (!name.trim()) {
      alert('Por favor, defina o seu nome de duelista!');
      return;
    }
    updateProfile({
      name: name.trim(),
      nickname: nickname.trim() || 'Rei dos Jogos',
      avatarUrl,
      theme,
      configured: true
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #151821 0%, #0b0c10 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div className="premium-glow animate-fade-in" style={{
        background: 'rgba(20, 24, 35, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '24px',
        width: '100%',
        maxWidth: '360px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--gold)', letterSpacing: '1px', margin: '0 0 4px 0' }}>
            🔮 CONFIGURAÇÃO INICIAL
          </h2>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Defina sua identidade de duelista para começar a jogar!
          </p>
        </div>

        {/* Avatar Select */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative' }}>
          <div 
            onClick={() => setShowAvatars(!showAvatars)}
            style={{ 
              position: 'relative', 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              border: '2px solid var(--gold)', 
              cursor: 'pointer',
              overflow: 'hidden',
              boxShadow: '0 0 12px rgba(212,175,55,0.2)'
            }}
            title="Escolher Avatar"
          >
            <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', fontSize: '8px', textAlign: 'center', padding: '3px 0' }}>
              ALTERAR
            </div>
          </div>

          <label className="qty-btn" style={{ fontSize: '10px', padding: '4px 10px', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Upload size={10} /> Enviar Imagem
            <input type="file" accept="image/*" onChange={handleUploadAvatar} style={{ display: 'none' }} />
          </label>

          {showAvatars && (
            <div style={{
              position: 'absolute',
              top: '90px',
              background: 'rgba(15,18,28,0.98)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              zIndex: 100,
              boxShadow: '0 8px 24px rgba(0,0,0,0.8)'
            }}>
              {avatars.map((av) => (
                <img
                  key={av.name}
                  src={av.url}
                  alt={av.name}
                  onClick={() => { setAvatarUrl(av.url); setShowAvatars(false); }}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    border: avatarUrl === av.url ? '2px solid var(--gold)' : '2px solid transparent',
                    cursor: 'pointer',
                    objectFit: 'cover',
                    transition: 'border-color 0.2s'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>NOME DO JOGADOR *</label>
            <input
              type="text"
              className="textbox"
              placeholder="Ex: Yugi Muto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '12px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>APELIDO / TÍTULO</label>
            <input
              type="text"
              className="textbox"
              placeholder="Ex: Rei dos Jogos"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '12px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>TEMA DO APLICATIVO</label>
            <select
              className="textbox"
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              style={{ padding: '8px 12px', fontSize: '12px', background: 'rgba(20,24,35,0.8)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <option value="default">Millennium Puzzle (Dourado)</option>
              <option value="dark-magician">Dark Magician (Roxo Neon)</option>
              <option value="blue-eyes">Blue-Eye (Azul Ice)</option>
            </select>
          </div>
        </div>

        <button
          className="btn-premium"
          onClick={handleStart}
          disabled={!name.trim()}
          style={{
            marginTop: '8px',
            fontSize: '12px',
            padding: '12px',
            width: '100%',
            fontWeight: 'bold',
            opacity: name.trim() ? 1 : 0.5,
            cursor: name.trim() ? 'pointer' : 'not-allowed',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          🔮 INICIAR JORNADA DE DUELOS
        </button>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('duel');
  const { loadingCards, loadingError, updateCardsDatabase, profile } = useApp();

  // If loading is done, but profile is not configured yet, intercept and show onboarding setup
  if (!loadingCards && !loadingError && profile && profile.configured === false) {
    return <OnboardingSetup />;
  }

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
