import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Award, ShieldCheck, Heart, Check, Sparkles, X, Database, RefreshCw } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    profile,
    updateProfile,
    decks,
    tournaments,
    allCards,
    updateCardsDatabase
  } = useApp();

  // --- States ---
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempNickname, setTempNickname] = useState(profile.nickname);
  const [favoriteDeckId, setFavoriteDeckId] = useState<string>('');

  // Preset Avatars list (Yugioh reference style)
  const avatars = [
    { name: 'Yugi', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150' }, 
    { name: 'Kaiba', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150' },
    { name: 'Pegasus', url: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=150' },
    { name: 'Joey', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150' },
    { name: 'Mai', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
    { name: 'Marik', url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150' },
  ];

  // --- Calculations ---
  const totalGames = profile.wins + profile.losses;
  const winrate = totalGames > 0 ? Math.round((profile.wins / totalGames) * 100) : 0;
  
  const favoriteDeck = decks.find(d => d.id === favoriteDeckId) || decks[0];

  // --- Actions ---
  const handleSaveProfile = () => {
    updateProfile({
      name: tempName.trim() || profile.name,
      nickname: tempNickname.trim() || profile.nickname
    });
    setIsEditing(false);
  };

  const handleSelectAvatar = (url: string) => {
    updateProfile({ avatarUrl: url });
    setShowAvatarModal(false);
  };

  return (
    <div className="profile-container">
      {/* Profile Card Header */}
      <div className="profile-card premium-glow">
        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '4px' }} className="no-print">
          <span className="profile-title-tag" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Sparkles size={10} fill="var(--gold)" /> LENDÁRIO
          </span>
        </div>

        {/* Avatar trigger */}
        <div className="avatar-wrapper" onClick={() => setShowAvatarModal(true)} title="Alterar Avatar">
          <img src={profile.avatarUrl} alt="Avatar" className="avatar-image" />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', fontSize: '8px', textAlign: 'center', padding: '2px 0', color: '#fff' }}>
            ALTERAR
          </div>
        </div>

        {/* Info */}
        <div className="profile-info" style={{ flex: 1 }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                className="textbox"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                style={{ padding: '4px 8px', fontSize: '14px' }}
              />
              <input
                type="text"
                className="textbox"
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                style={{ padding: '4px 8px', fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}
              />
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <button className="qty-btn" onClick={handleSaveProfile} style={{ background: 'var(--gold)', color: '#000' }}><Check size={10} /></button>
                <button className="qty-btn" onClick={() => setIsEditing(false)} style={{ color: 'var(--red)' }}><X size={10} /></button>
              </div>
            </div>
          ) : (
            <div onClick={() => { setTempName(profile.name); setTempNickname(profile.nickname); setIsEditing(true); }} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ fontSize: '16px', color: '#fff' }}>{profile.name}</strong>
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                {profile.nickname || '@rei_dos_jogos'}
              </div>
            </div>
          )}
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
            Título: Mestre Duelista Celestial
          </span>
        </div>
      </div>

      {/* Stats Grid Dashboard */}
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-value">{profile.wins}</div>
          <div className="stat-label">Vitórias</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{profile.losses}</div>
          <div className="stat-label">Derrotas</div>
        </div>
        <div className="stat-box" style={{ borderColor: winrate >= 70 ? 'var(--gold-glow)' : 'rgba(255,255,255,0.08)' }}>
          <div className="stat-value" style={{ color: winrate >= 70 ? 'var(--gold)' : '#fff' }}>{winrate}%</div>
          <div className="stat-label">Taxa Vit.</div>
        </div>
      </div>

      {/* Favorite Decks section */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Heart size={14} fill="var(--gold)" /> Deck Favorito
        </h3>

        {decks.length === 0 ? (
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', padding: '6px 0' }}>
            Nenhum deck criado para destacar. Vá na aba Decks para começar!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Selecione o Favorito:</span>
              <select
                className="textbox"
                value={favoriteDeckId}
                onChange={(e) => setFavoriteDeckId(e.target.value)}
                style={{ padding: '4px 8px', fontSize: '11px', flex: 1 }}
              >
                <option value="">Nenhum</option>
                {decks.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {favoriteDeck && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--gold)', marginTop: '4px' }}>
                <strong style={{ fontSize: '13px', color: '#fff' }}>{favoriteDeck.name}</strong>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Main: {favoriteDeck.mainDeck.length} cartas</span>
                  <span>Extra: {favoriteDeck.extraDeck.length} cartas</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tournaments History list */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Award size={14} style={{ color: 'var(--blue)' }} /> Histórico Recente de Torneios
        </h3>
        {tournaments.length === 0 ? (
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', padding: '6px 0' }}>
            Nenhum torneio disputado ainda. Cadastre jogadores na aba Torneio!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '110px', overflowY: 'auto' }}>
            {tournaments.map(t => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  background: 'rgba(255,255,255,0.01)',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  borderLeft: '2px solid rgba(255,255,255,0.1)'
                }}
              >
                <span style={{ fontWeight: '600', color: '#fff' }}>{t.name}</span>
                <span style={{ color: t.winner ? 'var(--gold)' : 'rgba(255,255,255,0.4)' }}>
                  {t.winner ? `Vencedor: ${t.winner}` : 'Em andamento'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cards Database Cache Sync */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={14} style={{ color: 'var(--gold)' }} /> Banco de Dados de Cartas (Offline)
        </h3>
        <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.01)', padding: '8px', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Total em Cache:</span>
            <strong style={{ color: '#fff' }}>{allCards.length} cartas</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Última Sincronização:</span>
            <strong style={{ color: '#fff' }}>
              {localStorage.getItem('yugioh_cards_last_update') ? new Date(localStorage.getItem('yugioh_cards_last_update')!).toLocaleString() : 'Nunca'}
            </strong>
          </div>
          <button
            className="btn-premium"
            onClick={updateCardsDatabase}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', padding: '6px 12px', marginTop: '6px' }}
          >
            <RefreshCw size={12} /> Sincronizar Agora (YGOPRODeck API)
          </button>
        </div>
      </div>

      {/* Permanent Celestial Unlocked Status Banner */}
      <div 
        className="premium-ad-banner no-print" 
        style={{ 
          background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(20,24,35,0.85) 100%)', 
          border: '1px solid var(--gold)', 
          animation: 'pulse-glow 3s infinite ease-in-out',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          textAlign: 'left',
          gap: '12px'
        }}
      >
        <ShieldCheck size={32} style={{ color: 'var(--gold)', flexShrink: 0 }} />
        <div>
          <strong style={{ color: 'var(--gold)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Acesso Celestial Ativo</strong>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginTop: '4px', lineHeight: '1.4' }}>
            Você possui o status Lendário ativo! Todos os recursos premium (estatísticas de duelos, árvore de torneios, construtor e álbuns) estão 100% liberados gratuitamente.
          </p>
        </div>
      </div>

      {/* Preset Avatars Selector Modal */}
      {showAvatarModal && (
        <div className="standard-modal-overlay no-print">
          <div className="standard-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'var(--gold)', fontSize: '14px', fontWeight: '700' }}>Escolha seu Avatar</h3>
              <button onClick={() => setShowAvatarModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '10px 0' }}>
              {avatars.map((avatar) => (
                <div
                  key={avatar.name}
                  onClick={() => handleSelectAvatar(avatar.url)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden' }}>
                    <img src={avatar.url} alt={avatar.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontSize: '10px', color: '#fff' }}>{avatar.name}</span>
                </div>
              ))}
            </div>

            {/* Custom URL input option */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              <label style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>Ou insira a URL de uma foto customizada:</label>
              <input
                type="text"
                className="textbox"
                placeholder="https://exemplo.com/foto.jpg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSelectAvatar((e.target as HTMLInputElement).value);
                  }
                }}
                style={{ fontSize: '11px', padding: '6px 8px' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
