import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Award, Heart, Check, Sparkles, X, Database, RefreshCw, Download, Upload, ShieldAlert } from 'lucide-react';

const RANKS = [
  { title: 'Duelista Iniciante 🛡️', level: 1, minWins: 0, maxWins: 1, label: 'Iniciante', color: '#8b8b8b' },
  { title: 'Duelista de Bronze 🥉', level: 2, minWins: 1, maxWins: 5, label: 'Bronze', color: '#cd7f32' },
  { title: 'Duelista de Prata 🥈', level: 3, minWins: 5, maxWins: 10, label: 'Prata', color: '#c0c0c0' },
  { title: 'Duelista de Ouro ⭐', level: 4, minWins: 10, maxWins: 20, label: 'Ouro', color: '#ffd700' },
  { title: 'Duelista Platina ✨', level: 5, minWins: 20, maxWins: 35, label: 'Platina', color: '#e5e4e2' },
  { title: 'Duelista Lendário ⚔️', level: 6, minWins: 35, maxWins: 50, label: 'Lendário', color: '#ff4b4b' },
  { title: 'Rei dos Jogos 👑', level: 7, minWins: 50, maxWins: Infinity, label: 'Rei dos Jogos', color: 'var(--gold)' }
];

const getRank = (wins: number) => {
  const rank = RANKS.find(r => wins >= r.minWins && wins < r.maxWins);
  return rank || RANKS[RANKS.length - 1];
};

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

  const handleUploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 3 * 1024 * 1024) {
      alert('A imagem é muito grande! Escolha uma imagem de até 3MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        handleSelectAvatar(base64Url);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleIncrementWins = () => {
    updateProfile({ wins: profile.wins + 1 });
  };
  
  const handleDecrementWins = () => {
    if (profile.wins > 0) {
      updateProfile({ wins: profile.wins - 1 });
    }
  };

  const handleIncrementLosses = () => {
    updateProfile({ losses: profile.losses + 1 });
  };

  const handleDecrementLosses = () => {
    if (profile.losses > 0) {
      updateProfile({ losses: profile.losses - 1 });
    }
  };

  const handleExportBackup = () => {
    const keys = [
      'p1Lp', 'p2Lp', 'p1Name', 'p2Name', 'duelLogs', 
      'collection', 'customAlbums', 'favorites', 'decks', 
      'tournaments', 'profile'
    ];
    const backupData: Record<string, string | null> = {};
    
    keys.forEach(key => {
      backupData[key] = localStorage.getItem(`yugioh_duel_${key}`);
    });
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `ygottd_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backupData = JSON.parse(event.target?.result as string);
        if (!backupData || (typeof backupData !== 'object')) {
          throw new Error('Formato de backup inválido.');
        }
        
        Object.keys(backupData).forEach(key => {
          if (backupData[key] !== null) {
            localStorage.setItem(`yugioh_duel_${key}`, backupData[key]);
          }
        });
        
        alert('Backup restaurado com sucesso! O aplicativo será recarregado para aplicar as alterações.');
        window.location.reload();
      } catch (error) {
        alert('Erro ao importar backup: arquivo corrompido ou formato inválido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="profile-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Profile Card Header */}
      {(() => {
        const currentRank = getRank(profile.wins);
        return (
          <div className="profile-card premium-glow" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
            <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '4px' }} className="no-print">
              <span className="profile-title-tag" style={{ display: 'flex', alignItems: 'center', gap: '2px', background: currentRank.color + '22', color: currentRank.color, border: `1px solid ${currentRank.color}33`, fontSize: '8px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                <Sparkles size={10} fill={currentRank.color} /> {currentRank.label.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {/* Avatar trigger */}
              <div className="avatar-wrapper" onClick={() => setShowAvatarModal(true)} title="Alterar Avatar" style={{ position: 'relative' }}>
                <img src={profile.avatarUrl} alt="Avatar" className="avatar-image" />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', fontSize: '8px', textAlign: 'center', padding: '2px 0', color: '#fff', borderBottomLeftRadius: '50%', borderBottomRightRadius: '50%' }}>
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
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Ranking: <span style={{ color: currentRank.color, fontWeight: 'bold' }}>{currentRank.title}</span>
                </span>
              </div>
            </div>

            {/* Rank progress bar */}
            {currentRank.level < 7 && (
              <div style={{ marginTop: '4px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginBottom: '3px' }}>
                  <span>Progresso para Nível {currentRank.level + 1}</span>
                  <span>{profile.wins} / {currentRank.maxWins} Vitórias</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.round(((profile.wins - currentRank.minWins) / (currentRank.maxWins - currentRank.minWins)) * 100)}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${currentRank.color}88, ${currentRank.color})`,
                    boxShadow: `0 0 8px ${currentRank.color}66`,
                    transition: 'width 0.4s ease-out'
                  }} />
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Stats Grid Dashboard */}
      <div className="stats-grid">
        <div className="stat-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div className="stat-value">{profile.wins}</div>
          <div className="stat-label">Vitórias</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }} className="no-print">
            <button className="qty-btn" onClick={handleDecrementWins} style={{ padding: '2px 6px', height: '18px', width: '22px', fontSize: '9px' }}>-</button>
            <button className="qty-btn" onClick={handleIncrementWins} style={{ padding: '2px 6px', height: '18px', width: '22px', fontSize: '9px', background: 'var(--gold)', color: '#000' }}>+</button>
          </div>
        </div>
        <div className="stat-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div className="stat-value">{profile.losses}</div>
          <div className="stat-label">Derrotas</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }} className="no-print">
            <button className="qty-btn" onClick={handleDecrementLosses} style={{ padding: '2px 6px', height: '18px', width: '22px', fontSize: '9px' }}>-</button>
            <button className="qty-btn" onClick={handleIncrementLosses} style={{ padding: '2px 6px', height: '18px', width: '22px', fontSize: '9px', background: 'var(--gold)', color: '#000' }}>+</button>
          </div>
        </div>
        <div className="stat-box" style={{ borderColor: winrate >= 70 ? 'var(--gold-glow)' : 'rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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

      {/* Backup and Restore System */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={14} style={{ color: 'var(--blue)' }} /> Sistema de Backup Inteligente
        </h3>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4' }}>
          Exporte seus dados (perfil, vitórias, coleções de cartas e decks) em um único arquivo de backup seguro ou restaure-os a partir de um arquivo salvo.
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button
            className="btn-premium"
            onClick={handleExportBackup}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', padding: '6px 12px', flex: 1, background: 'rgba(212,175,55,0.15)', border: '1px solid var(--gold)' }}
          >
            <Download size={12} /> Exportar Dados
          </button>
          
          <label
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', padding: '6px 12px', flex: 1, cursor: 'pointer', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Upload size={12} /> Importar Dados
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Security Warning info */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '3px solid var(--gold)', background: 'rgba(212,175,55,0.02)' }}>
        <h4 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
          <ShieldAlert size={12} /> Nota sobre Instalação Nativa
        </h4>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.4', margin: 0 }}>
          Ao instalar o APK em aparelhos como Xiaomi, o sistema pode alertar sobre "desenvolvedor desconhecido" ou "risco de segurança". Isso é perfeitamente normal para aplicativos em desenvolvimento instalados externamente (sem assinatura da Google Play Store). O app é 100% seguro!
        </p>
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

            {/* File upload option */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
              <label style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>Ou envie uma imagem do seu aparelho:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadAvatar}
                style={{ display: 'none' }}
                id="avatar-file-upload-input"
              />
              <label
                htmlFor="avatar-file-upload-input"
                className="btn-premium"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
                  border: '1px dashed var(--gold)',
                  color: 'var(--gold)',
                  boxShadow: 'none',
                  margin: '4px 0'
                }}
              >
                <Upload size={13} /> Selecionar Imagem Local
              </label>
            </div>

            {/* Custom URL input option */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
              <label style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>Ou insira a URL de uma foto da internet:</label>
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
