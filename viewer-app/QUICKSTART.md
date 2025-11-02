# ⚡ Guia Rápido - HaskTreeView Viewer

## 🎯 Em 3 Passos

### 1️⃣ Instalar
```powershell
cd viewer-app
npm install
```

### 2️⃣ Executar
```powershell
npm run dev
```

### 3️⃣ Acessar
```
http://localhost:3000
```

---

## 📂 Ou Use o Script de Setup

```powershell
cd viewer-app
.\setup.ps1
```

O script irá:
- ✅ Verificar Node.js e npm
- ✅ Instalar dependências (se necessário)
- ✅ Mostrar menu de opções

---

## 🎮 Opções no Menu

1. **Desenvolvimento** - `npm run dev`
2. **Build** - `npm run build`
3. **Preview** - `npm run preview`
4. **Lint** - `npm run lint`

---

## 🔥 Comandos Úteis

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento com hot reload |
| `npm run build` | Cria build otimizado em `dist/` |
| `npm run preview` | Visualiza o build de produção |
| `npm run lint` | Verifica qualidade do código |

---

## 📖 Mais Informações

- 📘 **README.md** - Documentação completa
- 📗 **REFACTORING.md** - Detalhes da refatoração
- 📕 **STRUCTURE.md** - Estrutura do projeto

---

## 💡 Dicas

### Primeiro Uso
1. Execute `npm run dev`
2. Clique em "Carregar Exemplo"
3. Explore o grafo interativo

### Carregando Seu JSON
1. Use arquivos da pasta `output/`
2. Ou crie seu próprio JSON (veja JSON_ARCHITECTURE.md)

### Interagindo
- **Arrastar** - Mover grafo
- **Scroll** - Zoom in/out
- **Hover** - Destacar nó
- **Click** - Ver detalhes

---

## 🆘 Problemas Comuns

### Node.js não encontrado
```powershell
# Instale de: https://nodejs.org/
node --version
npm --version
```

### Porta 3000 ocupada
```powershell
# Vite usa próxima porta disponível automaticamente
# Ou configure em vite.config.ts
```

### Erro ao instalar
```powershell
# Limpe cache e reinstale
rm -r node_modules
npm install
```

---

## ✨ Pronto para Começar!

```powershell
cd viewer-app
npm install
npm run dev
```

**Aproveite! 🚀**
