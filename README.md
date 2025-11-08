# HaskTreeView

## Descrição

Este projeto Haskell realiza análise de código React Native (JavaScript e TypeScript) e gera um JSON com a árvore de dependências. Agora inclui um **visualizador moderno** construído com React + TypeScript + Vite!

## 🌳 Componentes do Projeto

### 1. Analisador Haskell
Analisa projetos TypeScript/JavaScript e gera JSON com dependências.

### 2. Visualizador (NOVO! ✨)
Aplicação React moderna para visualizar a árvore de dependências de forma interativa.

**Versões disponíveis:**
- ❌ `viewer.html` - Versão antiga (monolito - deprecated)
- ✅ `viewer-app/` - **Versão nova** (React + TypeScript + Vite)

---

## 🚀 Quick Start do Visualizador

```bash
cd viewer-app
yarn install
yarn dev
```


**Documentação completa:** [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

---

## 📚 Documentação

- 📘 [VIEWER_REFACTORING.md](VIEWER_REFACTORING.md) - Visão geral da refatoração do viewer
- 📗 [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - Índice completo de documentação
- 📕 [viewer-app/README.md](viewer-app/README.md) - Documentação do visualizador
- 📄 [JSON_ARCHITECTURE.md](JSON_ARCHITECTURE.md) - Formato do JSON

---

## 🧪 Projeto de Teste e Análise

O próprio **`viewer-app/`** é usado como projeto de teste para o analisador Haskell!

### Por que usar o viewer como teste?

- ✅ **Projeto real** - Código de produção, não simulado
- ✅ **Complexidade adequada** - Múltiplos componentes, hooks e utilitários
- ✅ **Auto-análise** - O visualizador pode analisar sua própria estrutura
- ✅ **Validação contínua** - Cada refatoração gera novos dados de teste
- ✅ **Casos reais** - Dependências circulares, componentes isolados, etc.

### Como analisar o viewer

```bash
# Configure o analisador para o viewer-app
stack exec HaskTreeView-exe 

# O JSON será gerado em output/
# Abra o visualizador para ver a análise do próprio viewer!
```


---

## Como Executar o Analisador Haskell

Para executar este projeto, você precisa ter o [Stack](https://docs.haskellstack.org/en/stable/README/) instalado.

1. Clone o repositório:
   ```bash
   git clone https://github.com/joelington321/HaskTreeView.git
   cd HaskTreeView
   ```

2. Compile o projeto:
   ```bash
   stack build
   ```

3. Execute o projeto:
   ```bash
   stack exec HaskTreeView-exe
   ```

4. O JSON será gerado na pasta `output/`

5. Use o visualizador para ver o resultado:
   ```bash
   cd viewer-app
   npm install
   npm run dev
   ```

---

## 📊 Estrutura do Projeto

```
HaskTreeView/
├── app/                    # Aplicação Haskell
├── src/                    # Código-fonte Haskell
├── test/                   # Testes Haskell
├── output/                 # JSONs gerados
└── viewer-app/             # ✅ Viewer novo (React + TS + Vite)
    ├── src/
    │   ├── components/     # Componentes React
    │   ├── hooks/          # Hooks customizados
    │   ├── utils/          # Utilitários
    │   └── types/          # Tipos TypeScript
    └── README.md           # Documentação do viewer
```

---

## 🎯 Recursos do Visualizador

- ✅ **Interativo** - Zoom, pan, hover e click
- ✅ **Detecção de Ciclos** - Identifica dependências circulares
- ✅ **Componentes Desconexos** - Visualiza árvores isoladas
- ✅ **TypeScript** - Código tipado e seguro
- ✅ **Modular** - Fácil de manter e expandir
- ✅ **Hot Reload** - Desenvolvimento rápido

---

## 🛠️ Tecnologias

### Analisador
- Haskell
- Stack

### Visualizador
- React 18
- TypeScript 5
- Vite 5
- Canvas API

---

## �️ Roadmap - Evolução Planejada

### 🔄 Melhorias na Arquitetura

#### **Detecção de Ciclos no Backend**
- [ ] **Refatorar arquitetura do JSON** - Mover detecção de dependências circulares para o Haskell
- [ ] Adicionar campo `cycles` no JSON de saída
- [ ] Pré-calcular ciclos durante análise estática
- [ ] Melhorar performance do frontend removendo cálculos redundantes

#### **Análise de Código Morto**
- [ ] **Rastreamento de funções não utilizadas**
  - [ ] Detectar exports que nunca são importados
  - [ ] Identificar funções internas não referenciadas
  - [ ] Gerar relatório de código morto
  - [ ] Sugestões de limpeza automatizada

### 🎨 Melhorias no Visualizador

#### **Interface e UX**
- [ ] Dashboard com métricas do projeto
- [ ] Filtros avançados (por tipo, tamanho, dependências)
- [ ] Busca e navegação por arquivos
- [ ] Exportação para PNG/SVG
- [ ] Temas customizáveis (dark/light)
- [ ] Comparação entre versões do projeto

#### **Visualizações Adicionais**
- [ ] Mapa de calor (arquivos mais conectados)

### 🌐 Suporte Multi-Linguagem

#### **Linguagens Planejadas**
- [ ] **Haskell** - Auto-análise do próprio projeto
- [ ] **Python** - Import tracking
---

## �📄 Licença

Este projeto está sob licença MIT.

