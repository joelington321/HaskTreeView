# HaskTreeView Viewer

Visualizador moderno de dependências de projeto construído com **React + TypeScript + Vite**.

## 🎯 Características

- ✅ **Atomic Design** - Arquitetura escalável e organizada
- ✅ **Componentização React** - Código modular e reutilizável
- ✅ **TypeScript** - Tipagem forte para maior confiabilidade
- ✅ **Vite** - Build ultra-rápido com hot reload
- ✅ **Canvas API** - Renderização de grafos interativa
- ✅ **Detecção de Ciclos** - Identifica dependências circulares
- ✅ **Árvores Desconexas** - Visualiza componentes isolados
- ✅ **Interatividade** - Zoom, pan, hover e click nos nós

## 📁 Estrutura do Projeto (Atomic Design)

```
viewer-app/
├── src/
│   ├── screens/             # 🖥️ Páginas completas
│   │   └── DashboardScreen.tsx
│   ├── components/
│   │   ├── atoms/           # ⚛️ Componentes básicos
│   │   │   ├── Header/      # Cabeçalho
│   │   │   ├── Legend/      # Legenda
│   │   │   └── Stats/       # Estatísticas
│   │   ├── molecules/       # 🧬 Combinação de átomos
│   │   │   ├── Controls/    # Controles de carregamento
│   │   │   └── InfoPanel/   # Painel de informações
│   │   └── organisms/       # 🦠 Seções complexas
│   │       └── GraphCanvas/ # Canvas de renderização
│   ├── hooks/               # Hooks customizados
│   │   ├── useGraphData.ts        # Processamento de dados
│   │   └── useCanvasInteraction.ts # Interação com canvas
│   ├── utils/               # Utilitários
│   │   ├── cycleDetection.ts      # Detecção de ciclos
│   │   ├── componentDetection.ts  # Detecção de componentes
│   │   ├── helpers.ts             # Funções auxiliares
│   │   └── layout/                # Algoritmos de layout
│   ├── rendering/           # Sistema de renderização
│   ├── constants/           # Constantes
│   ├── types/               # Definições TypeScript
│   ├── styles/              # Estilos globais
│   ├── App.tsx              # Componente principal
│   └── main.tsx             # Ponto de entrada
├── package.json
├── tsconfig.json
├── vite.config.ts
├── ATOMIC_DESIGN.md         # 📘 Documentação Atomic Design
└── README.md
```

**📘 [Ver documentação completa do Atomic Design](ATOMIC_DESIGN.md)**

## 🚀 Como Usar

### Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn

### Instalação

1. **Entre na pasta do projeto:**
   ```powershell
   cd viewer-app
   ```

2. **Instale as dependências:**
   ```powershell
   npm install
   ```

### Executar em Desenvolvimento

```powershell
npm run dev
```

Acesse: http://localhost:3000

### Build para Produção

```powershell
npm run build
```

Os arquivos otimizados estarão em `dist/`

### Visualizar Build

```powershell
npm run preview
```

## 🎮 Como Usar a Aplicação

1. **Carregar JSON:**
   - Clique em "Carregar JSON" e selecione um arquivo `.json`
   - Ou clique em "Carregar Exemplo" para ver um exemplo

2. **Interagir com o Grafo:**
   - **Arrastar:** Segure e arraste para mover o grafo
   - **Zoom:** Use a roda do mouse para zoom in/out
   - **Hover:** Passe o mouse sobre nós para destacar conexões
   - **Click:** Clique em um nó para ver detalhes

3. **Resetar Visualização:**
   - Clique em "Resetar Visualização" para centralizar

## 📊 Formato do JSON

O viewer espera um JSON com a seguinte estrutura:

```json
{
  "projectName": "nome-do-projeto",
  "analyzedAt": "2025-11-01T10:30:00Z",
  "fileRegistry": {
    "0": "/caminho/completo/do/projeto",
    "1": "App.tsx",
    "2": "src/Component1/index.tsx"
  },
  "dependencies": [
    {
      "fileId": "1",
      "imports": ["2"],
      "importedBy": []
    }
  ]
}
```

Veja `JSON_ARCHITECTURE.md` na raiz do projeto para mais detalhes.

## 🎨 Customização

### Configuração Visual

Edite `DEFAULT_CONFIG` em `src/App.tsx`:

```typescript
const DEFAULT_CONFIG: CanvasConfig = {
  nodeRadius: 20,
  nodeColor: '#fff',
  nodeHoverColor: '#0066cc',
  nodeCircularColor: '#ff3333',
  lineColor: '#fff',
  lineCircularColor: '#ff3333',
  lineWidth: 2,
  verticalSpacing: 150,
  horizontalSpacing: 200,
  componentSpacing: 250,
};
```

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **Vite 5** - Build tool
- **Canvas API** - Renderização de grafos

## 📝 Vantagens da Refatoração

### Antes (Monolito - viewer.html)
- ❌ Mais de 1000 linhas em um único arquivo
- ❌ Mistura de HTML, CSS e JavaScript
- ❌ Difícil de testar e manter
- ❌ Sem modularização
- ❌ JavaScript sem tipagem

### Depois (Modular - React + TS)
- ✅ Código organizado em múltiplos arquivos
- ✅ Separação clara de responsabilidades
- ✅ Componentes reutilizáveis
- ✅ Hooks customizados para lógica
- ✅ TypeScript com tipagem forte
- ✅ Fácil de testar e expandir
- ✅ Hot reload para desenvolvimento

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Visualiza build de produção
- `npm run lint` - Executa linter

## 📄 Licença

Este projeto faz parte do HaskTreeView.

## 🤝 Contribuindo

Sinta-se à vontade para abrir issues e pull requests!
