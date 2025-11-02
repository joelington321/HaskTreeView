# 📁 Estrutura Completa do Projeto Refatorado

## 🗂️ Visão Geral

```
viewer-app/
│
├── 📄 Configuration Files
│   ├── package.json           # Dependências e scripts
│   ├── tsconfig.json          # Configuração TypeScript
│   ├── tsconfig.node.json     # TS config para Vite
│   ├── vite.config.ts         # Configuração Vite
│   ├── .eslintrc.cjs          # Regras ESLint
│   ├── .editorconfig          # Formatação
│   └── .gitignore             # Arquivos ignorados
│
├── 📚 Documentation
│   ├── README.md              # Documentação principal
│   ├── REFACTORING.md         # Detalhes da refatoração
│   └── setup.ps1              # Script de instalação
│
├── 🌐 Entry Point
│   └── index.html             # HTML principal
│
└── 📂 src/                    # Código-fonte
    │
    ├── 🎨 Components/         # Componentes React
    │   ├── Header.tsx         # Cabeçalho
    │   ├── Header.css
    │   ├── Controls.tsx       # Controles de arquivo
    │   ├── Controls.css
    │   ├── GraphCanvas.tsx    # Canvas principal
    │   ├── GraphCanvas.css
    │   ├── InfoPanel.tsx      # Painel de info
    │   ├── InfoPanel.css
    │   ├── Stats.tsx          # Estatísticas
    │   ├── Stats.css
    │   ├── Legend.tsx         # Legenda
    │   └── Legend.css
    │
    ├── 🪝 Hooks/              # Hooks customizados
    │   ├── useGraphData.ts           # Processamento de dados
    │   └── useCanvasInteraction.ts   # Interação canvas
    │
    ├── 🛠️ Utils/              # Utilitários
    │   ├── cycleDetection.ts         # Detecta ciclos
    │   ├── componentDetection.ts     # Detecta componentes
    │   ├── layoutAlgorithms.ts       # Calcula layouts
    │   └── helpers.ts                # Funções auxiliares
    │
    ├── 📝 Types/              # Definições TypeScript
    │   └── index.ts           # Todas as interfaces
    │
    ├── 🚀 Main Files
    │   ├── App.tsx            # Componente principal
    │   ├── App.css            # Estilos globais
    │   └── main.tsx           # Entry point React
    │
    └── 📦 Build Output (após npm run build)
        └── dist/              # Arquivos otimizados
```

---

## 📊 Métricas do Projeto

### Arquivos por Categoria

| Categoria | Quantidade | Descrição |
|-----------|------------|-----------|
| **Componentes** | 6 | UI Components React |
| **CSS** | 6 | Estilos por componente |
| **Hooks** | 2 | Lógica reutilizável |
| **Utils** | 4 | Funções auxiliares |
| **Types** | 1 | Definições TypeScript |
| **Config** | 6 | Arquivos de configuração |
| **Docs** | 3 | Documentação |
| **Total** | 28 | Arquivos principais |

### Linhas de Código (aproximado)

| Arquivo | Linhas | Responsabilidade |
|---------|--------|------------------|
| **GraphCanvas.tsx** | ~350 | Renderização do grafo |
| **useGraphData.ts** | ~150 | Processamento de dados |
| **useCanvasInteraction.ts** | ~150 | Interação com canvas |
| **layoutAlgorithms.ts** | ~130 | Cálculo de posições |
| **componentDetection.ts** | ~70 | Detectar componentes |
| **cycleDetection.ts** | ~45 | Detectar ciclos |
| **Outros componentes** | ~50-100 cada | UI e lógica específica |

**Total: ~1000 linhas** distribuídas em 28 arquivos modulares  
vs. **1000+ linhas** em 1 único arquivo monolítico

---

## 🎯 Responsabilidades por Arquivo

### 📱 Componentes (UI)

#### Header.tsx
```typescript
- Renderizar cabeçalho
- Exibir título e descrição
```

#### Controls.tsx
```typescript
- Input de arquivo
- Botão de reset
- Botão de carregar exemplo
```

#### GraphCanvas.tsx
```typescript
- Renderizar canvas
- Desenhar nós e conexões
- Desenhar contornos de componentes
- Aplicar transformações (zoom, pan)
```

#### InfoPanel.tsx
```typescript
- Exibir informações do nó selecionado
- Mostrar imports/importedBy
- Destacar nós circulares
```

#### Stats.tsx
```typescript
- Exibir estatísticas do projeto
- Total de arquivos
- Conexões, ciclos, componentes
```

#### Legend.tsx
```typescript
- Exibir legenda visual
- Cores de nós e conexões
```

---

### 🪝 Hooks (Lógica)

#### useGraphData.ts
```typescript
- Processar dados JSON
- Detectar ciclos
- Detectar componentes conectados
- Calcular layout dos nós
- Criar conexões
- Calcular estatísticas
- Carregar de arquivo/URL
```

#### useCanvasInteraction.ts
```typescript
- Gerenciar referência do canvas
- Controlar viewport (offset, scale)
- Detectar drag & drop
- Detectar hover
- Detectar click
- Zoom com scroll
- Redimensionar canvas
```

---

### 🛠️ Utilitários (Funções)

#### cycleDetection.ts
```typescript
- Detectar ciclos com DFS
- Retornar lista de ciclos
- Identificar nós em ciclos
```

#### componentDetection.ts
```typescript
- Encontrar componentes conectados
- BFS para agrupar nós
- Retornar árvores desconexas
```

#### layoutAlgorithms.ts
```typescript
- Calcular layout hierárquico
- Calcular layout circular
- Posicionar nós por profundidade
- Separar componentes
```

#### helpers.ts
```typescript
- Aplicar opacidade em cores
- Extrair nome de arquivo
- Formatar datas
```

---

### 📝 Tipos (TypeScript)

#### types/index.ts
```typescript
// Dados carregados
- DependencyData
- FileDependency

// Estruturas internas
- GraphNode
- GraphConnection
- ConnectedComponent
- Cycle

// UI e Config
- GraphStats
- ViewportState
- CanvasConfig
```

---

## 🔄 Fluxo de Dados

```
1. Usuário carrega JSON
   ↓
2. useGraphData processa
   ├── detectCycles()
   ├── findConnectedComponents()
   ├── calculateLayout()
   └── createConnections()
   ↓
3. Dados fluem para componentes
   ├── GraphCanvas (renderiza)
   ├── Stats (exibe estatísticas)
   └── InfoPanel (mostra detalhes)
   ↓
4. useCanvasInteraction gerencia
   ├── Zoom
   ├── Pan
   ├── Hover
   └── Click
   ↓
5. Re-renderização React
```

---

## 🎨 Padrões de Design Utilizados

### 1. **Component Pattern**
Cada parte da UI é um componente isolado

### 2. **Custom Hooks Pattern**
Lógica reutilizável encapsulada em hooks

### 3. **Utility Functions Pattern**
Funções puras para operações específicas

### 4. **Type-Safe Pattern**
TypeScript para prevenir erros

### 5. **Single Responsibility**
Cada arquivo tem uma única responsabilidade

### 6. **Separation of Concerns**
UI, lógica e estilos separados

---

## 📦 Dependências

### Produção
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

### Desenvolvimento
```json
{
  "@types/react": "^18.2.43",
  "@types/react-dom": "^18.2.17",
  "@typescript-eslint/eslint-plugin": "^6.14.0",
  "@typescript-eslint/parser": "^6.14.0",
  "@vitejs/plugin-react": "^4.2.1",
  "eslint": "^8.55.0",
  "typescript": "^5.2.2",
  "vite": "^5.0.8"
}
```

**Total:** ~150KB (minificado e gzipado)

---

## 🚀 Build & Deploy

### Development
```powershell
npm run dev       # http://localhost:3000
```

### Production
```powershell
npm run build     # Cria dist/
npm run preview   # Testa build localmente
```

### Output (dist/)
```
dist/
├── index.html          # HTML otimizado
├── assets/
│   ├── index-[hash].js      # Bundle JS minificado
│   └── index-[hash].css     # CSS minificado
└── vite.svg
```

---

## ✅ Checklist de Qualidade

- ✅ **TypeScript** - Tipagem forte
- ✅ **ESLint** - Código padronizado
- ✅ **EditorConfig** - Formatação consistente
- ✅ **Modular** - Código organizado
- ✅ **Documentado** - README completo
- ✅ **Performático** - Build otimizado
- ✅ **Escalável** - Fácil expandir

---

## 🎓 Conclusão

A refatoração criou uma base sólida para:

- ✅ Manutenção fácil
- ✅ Expansão rápida
- ✅ Trabalho em equipe
- ✅ Qualidade garantida
- ✅ Performance otimizada

**Código organizado = Projeto sustentável** 🚀
