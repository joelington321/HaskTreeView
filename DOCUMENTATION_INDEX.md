# 📚 Índice de Documentação - HaskTreeView Viewer

## 🎯 Início Rápido

**Quer começar agora?** Vá direto para:
- 📄 [viewer-app/QUICKSTART.md](viewer-app/QUICKSTART.md) - 3 passos para começar

---

## 📖 Documentação Completa

### 📁 Na Raiz do Projeto

| Arquivo | Descrição |
|---------|-----------|
| **VIEWER_REFACTORING.md** | Visão geral da refatoração (LEIA PRIMEIRO) |
| **JSON_ARCHITECTURE.md** | Formato do JSON de entrada |

### 📁 Em viewer-app/

| Arquivo | Descrição |
|---------|-----------|
| **QUICKSTART.md** | ⚡ Guia rápido de 3 passos |
| **README.md** | 📘 Documentação completa |
| **REFACTORING.md** | 📗 Detalhes da refatoração |
| **STRUCTURE.md** | 📕 Estrutura do projeto |

---

## 🗺️ Roteiro de Leitura

### Para Usuários (Quero Usar)

1. ⚡ [QUICKSTART.md](viewer-app/QUICKSTART.md)
   - Instalação e execução rápida
   
2. 📘 [README.md](viewer-app/README.md)
   - Como usar a aplicação
   - Customização básica

3. 📄 [JSON_ARCHITECTURE.md](JSON_ARCHITECTURE.md)
   - Formato do JSON aceito

### Para Desenvolvedores (Quero Entender/Modificar)

1. 📗 [VIEWER_REFACTORING.md](VIEWER_REFACTORING.md)
   - Por que foi refatorado
   - Comparação antes/depois
   
2. 📕 [viewer-app/STRUCTURE.md](viewer-app/STRUCTURE.md)
   - Estrutura completa do código
   - Responsabilidades de cada arquivo
   
3. 📗 [viewer-app/REFACTORING.md](viewer-app/REFACTORING.md)
   - Detalhes técnicos da refatoração
   - Padrões aplicados

4. 📘 [viewer-app/README.md](viewer-app/README.md)
   - Configuração avançada
   - Scripts disponíveis

---

## 🎯 Por Objetivo

### Quero instalar e executar
→ [viewer-app/QUICKSTART.md](viewer-app/QUICKSTART.md)

### Quero entender a refatoração
→ [VIEWER_REFACTORING.md](VIEWER_REFACTORING.md)

### Quero ver a estrutura do código
→ [viewer-app/STRUCTURE.md](viewer-app/STRUCTURE.md)

### Quero customizar o visual
→ [viewer-app/README.md](viewer-app/README.md) (seção Customização)

### Quero criar meu próprio JSON
→ [JSON_ARCHITECTURE.md](JSON_ARCHITECTURE.md)

### Quero adicionar novas features
→ [viewer-app/REFACTORING.md](viewer-app/REFACTORING.md) (seção Próximos Passos)

---

## 📂 Estrutura de Arquivos

```
HaskTreeView/
│
├── 📄 VIEWER_REFACTORING.md     # Visão geral (COMECE AQUI)
├── 📄 JSON_ARCHITECTURE.md      # Formato do JSON
├── 📄 README.md                 # README do projeto Haskell
│
├── 📄 viewer.html               # ❌ Versão antiga (monolito)
│
└── 📁 viewer-app/               # ✅ Versão nova (refatorada)
    │
    ├── 📄 QUICKSTART.md         # ⚡ Início rápido (3 passos)
    ├── 📄 README.md             # 📘 Documentação completa
    ├── 📄 REFACTORING.md        # 📗 Detalhes da refatoração
    ├── 📄 STRUCTURE.md          # 📕 Estrutura do código
    ├── 📄 setup.ps1             # 🔧 Script de instalação
    │
    ├── 📁 src/                  # Código-fonte
    │   ├── 📁 components/       # 6 componentes React
    │   ├── 📁 hooks/            # 2 hooks customizados
    │   ├── 📁 utils/            # 4 utilitários
    │   ├── 📁 types/            # Tipos TypeScript
    │   ├── App.tsx
    │   └── main.tsx
    │
    └── 📁 Config files          # Configurações
        ├── package.json
        ├── tsconfig.json
        ├── vite.config.ts
        └── .eslintrc.cjs
```

---

## 🚀 Fluxo Recomendado

### 1️⃣ Primeira Vez

```
VIEWER_REFACTORING.md
    ↓
viewer-app/QUICKSTART.md
    ↓
Executar a aplicação
    ↓
Explorar e testar
```

### 2️⃣ Quero Entender Melhor

```
viewer-app/STRUCTURE.md
    ↓
viewer-app/REFACTORING.md
    ↓
Explorar código-fonte
```

### 3️⃣ Quero Modificar/Expandir

```
viewer-app/README.md (Customização)
    ↓
viewer-app/STRUCTURE.md (Arquitetura)
    ↓
Código-fonte (src/)
```

---

## 📊 Resumo por Documento

### VIEWER_REFACTORING.md (Raiz)
- ✅ O que foi feito
- ✅ Comparação antes/depois
- ✅ Como começar
- ✅ Benefícios da refatoração

### viewer-app/QUICKSTART.md
- ✅ 3 passos para instalar
- ✅ Comandos básicos
- ✅ Dicas rápidas
- ✅ Problemas comuns

### viewer-app/README.md
- ✅ Documentação completa
- ✅ Como usar a aplicação
- ✅ Customização
- ✅ Tecnologias
- ✅ Scripts disponíveis

### viewer-app/REFACTORING.md
- ✅ Detalhes da refatoração
- ✅ O que foi criado
- ✅ Melhorias implementadas
- ✅ Próximos passos

### viewer-app/STRUCTURE.md
- ✅ Estrutura completa
- ✅ Responsabilidades
- ✅ Fluxo de dados
- ✅ Padrões aplicados
- ✅ Métricas

### JSON_ARCHITECTURE.md (Raiz)
- ✅ Formato do JSON
- ✅ Estrutura de dados
- ✅ Exemplos
- ✅ Convenções

---

## 🎓 Recursos Adicionais

### Scripts Úteis
- `setup.ps1` - Instalação interativa
- `npm run dev` - Desenvolvimento
- `npm run build` - Produção

### Exemplos de JSON
- `output/test-complex.json`
- `output/test-circular.json`
- `output/test-deep-hierarchy.json`

### Código-fonte
- `src/components/` - Componentes React
- `src/hooks/` - Hooks customizados
- `src/utils/` - Utilitários
- `src/types/` - Tipos TypeScript

---

## 🆘 Precisa de Ajuda?

1. **Instalação** → [QUICKSTART.md](viewer-app/QUICKSTART.md)
2. **Uso** → [README.md](viewer-app/README.md)
3. **Código** → [STRUCTURE.md](viewer-app/STRUCTURE.md)
4. **JSON** → [JSON_ARCHITECTURE.md](JSON_ARCHITECTURE.md)

---

## ✨ Comece Agora!

```powershell
cd viewer-app
npm install
npm run dev
```

**Boa exploração! 🚀**
