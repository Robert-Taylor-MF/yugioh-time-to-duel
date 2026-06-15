# 🔮 Yu-Gi-Oh! Time to Duel

[![React](https://img.shields.io/badge/React-19.0-blue.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF.svg?logo=vite)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.4-119EFF.svg?logo=capacitor)](https://capacitorjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Yu-Gi-Oh! Time to Duel** é uma aplicação web e mobile premium desenvolvida para entusiastas do card game Yu-Gi-Oh! O aplicativo oferece um ecossistema completo para duelistas organizarem suas coleções, montarem decks estruturados com validação de regras oficiais, simularem chaveamentos de torneios e controlarem seus pontos de vida (LP) com haptics de áudio de alta fidelidade e total funcionamento offline.

---

## 🚀 Funcionalidades Principais

### 1. ⚔️ Painel de Duelo (Calculadora de LP)
O coração do aplicativo em formato digital premium. Ideal para partidas físicas reais:
* **Controle de LP de 2 Jogadores**: Ajuste dinâmico de Pontos de Vida (com valores padrão de 8000).
* **Teclado Calculadora Integrado**: Permite adicionar (`+`) ou subtrair (`-`) quantias específicas ou usar botões rápidos (`-100`, `-500`, `-1000`, `+2000`).
* **Haptics e Feedback Sonoro**: Emite efeitos de áudio sintéticos integrados ao tocar em botões.
* **Ferramentas de Duelo**: Lançamento virtual de dados de duelo (1 a 6) e de moedas (Cara ou Coroa) com belas animações.
* **Histórico de Combate (Logs)**: Histórico completo e em tempo real detalhando todas as modificações de vida com data e hora.
* **Desfazer (Undo)**: Sistema robusto de histórico de ações com suporte a desfazer o último passo executado.

### 2. 🎴 Álbum & Catálogo Oficial (Offline-First)
Um sistema robusto para catálogo de cartas sincronizado com a API oficial **YGOPRODeck**:
* **Cache em Banco Local (IndexedDB)**: Faz download e armazena todas as cartas no IndexedDB do navegador. Isso garante funcionamento ultrarápido e offline após a primeira carga.
* **Filtros Avançados**: Buscas dinâmicas por Nome, Raridade (Common, Rare, Ultra Rare, etc.), Atributos e Tipo (Monstro, Magia, Armadilha, Extra Deck).
* **Organizador de Pastas (Álbuns customizados)**: Crie álbuns e divida suas cartas como em pastas físicas (ex: "Cartas Raras", "Monstros de Efeito").
* **Backup de Coleção**: Exporte toda a sua coleção e álbuns em formato `.json` ou imprima o catálogo de cartas diretamente para PDF com folhas de estilo otimizadas.
* **Favoritos**: Marque facilmente suas cartas favoritas para acesso rápido.

### 3. 🃏 Construtor de Decks (Deck Builder)
Crie e otimize seus decks com ferramentas analíticas:
* **Estrutura Tripla**: Organize seu deck dividindo as cartas entre *Main Deck*, *Extra Deck* (Fusões, Sincros, etc.) e *Side Deck*.
* **Validação Automática de Regras**: O sistema analisa se o deck possui o mínimo de 40 cartas, o máximo de 60, limites de extra/side deck (máximo de 15), e o limite de no máximo 3 cópias idênticas por deck.
* **Gráficos e Estatísticas**: Dashboard dinâmico mostrando a distribuição percentual de Monstros, Magias e Armadilhas do deck em formato gráfico.
* **Estratégias e Combos (Mindmap)**:
  * Campo de texto dedicado para notas táticas e guias de jogo.
  * Mapeamento visual em cascata de jogadas (Combos) detalhando os requisitos de mão inicial e o passo a passo com fluxo interativo conectivo.

### 4. 🏆 Módulo de Torneios (Chaveamento)
Gerenciador completo de competições locais para reunir seus amigos:
* **Chaveamento Interativo**: Suporte para torneios de eliminação simples contendo de 2 a 16 jogadores.
* **Árvores de Conectores Visuais**: Exibição em árvore dinâmica estilizada para as rodadas.
* **Vitórias Interativas**: Declare o vencedor de cada confronto diretamente tocando no nome do duelista. O sistema automaticamente avança o vencedor para a próxima chave.
* **Pódio**: Banner de premiação final parabenizando o grande campeão.

### 5. 👤 Perfil Lendário do Duelista
Mostre a sua jornada de campeão:
* **Estatísticas de Desempenho**: Histórico de vitórias, derrotas e cálculo automático de taxa de vitória (*Winrate*).
* **Customização**: Altere seu nome, apelido (@) e selecione imagens de avatares clássicos de Yu-Gi-Oh! ou utilize uma URL externa para sua foto de perfil.
* **Destaques**: Selecione e mostre seu deck favorito no cabeçalho do perfil.

---

## 🛠️ Stack Tecnológica

O projeto foi construído utilizando práticas modernas de desenvolvimento web e mobile:
* **React 19** e **TypeScript** para código robusto, performático e tipado.
* **Vite** para empacotamento rápido e HMR em tempo de desenvolvimento.
* **Capacitor 8** para empacotamento e exportação nativa de aplicativos Android.
* **Lucide React** para o design moderno de ícones de interface.
* **CSS Custom Properties (Variables)** para centralização de estilo de alta fidelidade visual, tema dark futurista e responsividade integrada.
* **Vanilla IndexedDB** para armazenamento offline nativo e local storage para persistência de preferências de perfil.

---

## 📁 Estrutura do Projeto

Abaixo, a organização dos principais arquivos e pastas do código-fonte:

```text
yugioh-time-to-duel/
├── android/                 # Código nativo do aplicativo Android (Capacitor)
├── public/                  # Assets públicos estáticos
├── src/
│   ├── assets/              # Imagens e estilos globais
│   ├── components/          # Componentes reutilizáveis compartilhados
│   │   ├── BottomNav.tsx       # Navegador de abas inferior
│   │   ├── CardDetailModal.tsx # Modal com detalhes e efeito da carta
│   │   └── Shell.tsx           # Estrutura container principal do app
│   ├── context/
│   │   └── AppContext.tsx      # State manager geral da aplicação (LP, Decks, Torneios)
│   ├── data/
│   │   └── defaultCards.ts     # Dados padrão e definições de interfaces de Cartas
│   ├── services/
│   │   ├── cardDb.ts           # Inicialização e queries do banco local IndexedDB
│   │   └── ygoApi.ts           # Integração com a API oficial do YGOPRODeck
│   ├── views/               # As 5 principais telas da aplicação
│   │   ├── AlbumView.tsx       # Visualizador de coleção e pastas de cartas
│   │   ├── DecksView.tsx       # Editor de Decks, estatísticas e fluxo de Combos
│   │   ├── DuelView.tsx        # Calculadora de LP, dados, moedas e logs de batalha
│   │   ├── TournamentsView.tsx # Cadastro de jogadores e chaves de torneios
│   │   └── ProfileView.tsx     # Estatísticas de duelista, avatares e status
│   ├── App.tsx              # Componente raiz carregando os contextos
│   ├── main.tsx             # Ponto de entrada do React
│   └── index.css            # Estilo CSS premium, gradientes e variáveis de cores
├── tsconfig.json            # Configurações do compilador TypeScript
└── vite.config.ts           # Configurações do Vite bundler
```

---

## 💻 Como Executar o Projeto Localmente

### Pré-requisitos
* **Node.js** (versão 18 ou superior recomendada)
* **npm** ou outro gerenciador de pacotes (Yarn, Pnpm)

### Passo a Passo

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/Robert-Taylor-MF/yugioh-time-to-duel.git
   cd yugioh-time-to-duel
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   Abra o endereço exibido no terminal (geralmente `http://localhost:5173`) no seu navegador.

4. **Compilar para produção**:
   ```bash
   npm run build
   ```
   Os arquivos finais otimizados serão gerados na pasta `/dist`.

---

## 📱 Compilando para Dispositivos Móveis (Android)

Graças ao **Capacitor**, você pode gerar o aplicativo nativo para Android facilmente:

1. **Instale as dependências nativas (se necessário)**:
   ```bash
   npm install @capacitor/android
   ```

2. **Gere a build de produção do React**:
   ```bash
   npm run build
   ```

3. **Sincronize o Capacitor**:
   ```bash
   npx cap sync
   ```

4. **Abra o projeto no Android Studio**:
   ```bash
   npx cap open android
   ```
   Dentro do Android Studio, basta plugar seu celular com modo depuração ativo ou iniciar um emulador, e executar a build no dispositivo de sua preferência.

---

## 📜 Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para obter mais detalhes.

*Nota: As imagens das cartas, nomes e marcas registradas relacionadas a Yu-Gi-Oh! pertencem à Konami Digital Entertainment e à Shueisha Inc. Este é um aplicativo de fãs feito para fins de utilidade de torneios sem fins lucrativos.*
