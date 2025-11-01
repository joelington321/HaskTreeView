# Arquitetura do JSON de Saída

Este documento descreve a estrutura do JSON gerado pela aplicação HaskTreeView ao analisar projetos TypeScript/JavaScript.

## Visão Geral

O JSON de saída representa a árvore de dependências de um projeto, mapeando as relações de importação entre arquivos.

## Estrutura

```json
{
  "projectName": "nome-do-projeto",
  "analyzedAt": "2025-11-01T10:30:00Z",
  "fileRegistry": {
    "0": "/caminho/completo/do/projeto",
    "1": "App.tsx",
    "2": "src/Component1/index.tsx",
    "-1": "react",
    "-2": "react-native"
  },
  "dependencies": [
    {
      "fileId": "1",
      "imports": ["2", "-1", "-2"],
      "importedBy": []
    }
  ]
}
```

## Campos Principais

### `projectName`
- **Tipo**: `string`
- **Descrição**: Nome do projeto analisado

### `analyzedAt`
- **Tipo**: `string` (ISO 8601)
- **Descrição**: Data e hora em que a análise foi realizada

### `fileRegistry`
- **Tipo**: `object` (dicionário)
- **Descrição**: Mapeamento de IDs para caminhos de arquivos
- **Estrutura de IDs**:
  - **`"0"`**: Sempre contém o caminho absoluto do diretório raiz do projeto
  - **IDs positivos** (`"1"`, `"2"`, `"3"`, ...): Arquivos internos do projeto (paths relativos)
  - **IDs negativos** (`"-1"`, `"-2"`, `"-3"`, ...): Dependências externas (node_modules, bibliotecas)

### `dependencies`
- **Tipo**: `array`
- **Descrição**: Lista de dependências para cada arquivo analisado
- **Campos de cada item**:
  - **`fileId`** (`string`): ID do arquivo (referência ao `fileRegistry`)
  - **`imports`** (`array` de `string`): IDs dos arquivos/módulos que este arquivo importa (dependências)
  - **`importedBy`** (`array` de `string`): IDs dos arquivos que importam este arquivo (dependentes)

## Convenções

### IDs de Arquivos

1. **ID "0" (Raiz do Projeto)**
   - Sempre presente
   - Contém o caminho absoluto do projeto
   - Exemplo: `"/home/user/projects/meu-projeto"` ou `"C:\\Dev\\HaskTreeView"`

2. **IDs Positivos (Arquivos Internos)**
   - Numeração sequencial: `"1"`, `"2"`, `"3"`, ...
   - Representam arquivos dentro do projeto
   - Paths são relativos ao diretório raiz
   - Exemplo: `"src/Component1/index.tsx"`

3. **IDs Negativos (Dependências Externas)**
   - Numeração sequencial negativa: `"-1"`, `"-2"`, `"-3"`, ...
   - Representam bibliotecas e módulos externos
   - Nome do pacote conforme declarado no import
   - Exemplos: `"react"`, `"react-native"`, `"lodash"`

### Relações de Dependência

- **`imports`**: Lista de IDs que o arquivo **depende** (é filho deles)
- **`importedBy`**: Lista de IDs que **dependem** deste arquivo (é pai deles)

## Exemplo Completo

```json
{
  "projectName": "fakePathTestTree",
  "analyzedAt": "2025-11-01T10:30:00Z",
  "fileRegistry": {
    "0": "C:\\Dev\\HaskTreeView\\fakePathTestTree",
    "1": "App.tsx",
    "2": "src/Component1/index.tsx",
    "3": "src/Component1/styles.ts",
    "4": "src/Component2/index.tsx",
    "5": "src/Component2/styles.ts",
    "-1": "react",
    "-2": "react-native"
  },
  "dependencies": [
    {
      "fileId": "1",
      "imports": ["2", "4", "-1", "-2"],
      "importedBy": []
    },
    {
      "fileId": "2",
      "imports": ["3", "-1", "-2"],
      "importedBy": ["1"]
    },
    {
      "fileId": "3",
      "imports": ["-2"],
      "importedBy": ["2"]
    },
    {
      "fileId": "4",
      "imports": ["5", "-1", "-2"],
      "importedBy": ["1"]
    },
    {
      "fileId": "5",
      "imports": ["-2"],
      "importedBy": ["4"]
    }
  ]
}
```

## Vantagens desta Arquitetura

1. **Eficiência**: Cada caminho de arquivo é armazenado apenas uma vez
2. **Simplicidade**: Estrutura clara e fácil de processar
3. **Flexibilidade**: Fácil adicionar novos campos no futuro
4. **Identificação**: IDs numéricos facilitam distinguir arquivos internos de externos
5. **Rastreabilidade**: Sempre é possível saber o caminho absoluto do projeto (ID "0")

## Processamento em Haskell

Esta estrutura foi projetada para ser facilmente gerada em Haskell usando bibliotecas como:
- `aeson` para serialização JSON
- `Data.Map` para o `fileRegistry`
- `Data.Text` para strings

## Uso Futuro

Este JSON será consumido por uma aplicação de visualização que:
- Renderizará a árvore de dependências
- Identificará dependências circulares
- Detectará arquivos órfãos
- Mostrará estatísticas do projeto
