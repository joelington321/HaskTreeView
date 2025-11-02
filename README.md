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
npm install
npm run dev
```

Acesse: http://localhost:3000

**Documentação completa:** [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

---

## 📚 Documentação

- 📘 [VIEWER_REFACTORING.md](VIEWER_REFACTORING.md) - Visão geral da refatoração do viewer
- 📗 [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - Índice completo de documentação
- 📕 [viewer-app/README.md](viewer-app/README.md) - Documentação do visualizador
- 📄 [JSON_ARCHITECTURE.md](JSON_ARCHITECTURE.md) - Formato do JSON

---

## Pasta de Testes

A pasta `fakePathTestTree/` contém um projeto React Native fictício usado para testar a aplicação Haskell. 
Estes arquivos são exemplos simulados e servem apenas como dados de entrada para validar a funcionalidade 
do analisador de código.

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
├── fakePathTestTree/       # Projeto de teste
├── viewer.html             # ❌ Viewer antigo (deprecated)
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

## 📄 Licença

Este projeto está sob licença MIT.

## 🤝 Contribuindo

Pull requests são bem-vindos! Para mudanças maiores, abra uma issue primeiro para discutir o que você gostaria de mudar.
