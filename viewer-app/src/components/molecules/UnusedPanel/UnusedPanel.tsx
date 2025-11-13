import { useState } from 'react';
import * as S from './UnusedPanel.styles';

interface UnusedPanelProps {
  unusedStyles: Array<{ name: string; file: string }>;
  unusedExports: Array<{ name: string; type: string; file: string; canBeInternal?: boolean }>;
  projectRoot?: string;
}

export function UnusedPanel({ unusedStyles, unusedExports, projectRoot }: UnusedPanelProps) {
  // Filtrar items que tem file definido
  const validUnusedStyles = unusedStyles.filter(s => s.file);
  const validUnusedExports = unusedExports.filter(e => e.file);
  
  const totalIssues = validUnusedStyles.length + validUnusedExports.length;

  // Estado para controlar seções abertas/fechadas (começam fechadas se tiverem items)
  const [stylesOpen, setStylesOpen] = useState(validUnusedStyles.length === 0);
  const [exportsOpen, setExportsOpen] = useState(validUnusedExports.length === 0);

  // Gerar URL do VS Code
  const getVSCodeUrl = (filePath: string | undefined): string => {
    if (!filePath) {
      return '#';
    }
    
    if (!projectRoot) {
      return `vscode://file/${filePath}`;
    }
    
    // Normalizar barras e construir caminho absoluto
    const normalizedRoot = projectRoot.replace(/\\/g, '/');
    const normalizedFile = filePath.replace(/\\/g, '/');
    const absolutePath = `${normalizedRoot}/${normalizedFile}`;
    
    return `vscode://file/${absolutePath}`;
  };

  if (totalIssues === 0) {
    return (
      <S.PanelContainer>
        <S.Title>🔎 Análise de Código Não Utilizado</S.Title>
        <S.EmptyState>
          <S.EmptyIcon>✅</S.EmptyIcon>
          <S.EmptyText>
            Parabéns! Nenhum código não utilizado foi detectado.
            <br />
            Seu projeto está limpo e otimizado!
          </S.EmptyText>
        </S.EmptyState>
      </S.PanelContainer>
    );
  }

  return (
    <S.PanelContainer>
      <S.Title>🔎 Análise de Código Não Utilizado</S.Title>
      
      <S.SectionHeader 
        onClick={() => setStylesOpen(!stylesOpen)}
        $hasItems={validUnusedStyles.length > 0}
      >
        <S.SectionTitle>
          {stylesOpen ? '▼' : '▶'} 🎨 Styled Components ({validUnusedStyles.length})
        </S.SectionTitle>
      </S.SectionHeader>
      
      {stylesOpen && (
        validUnusedStyles.length === 0 ? (
          <S.SuccessMessage>
            ✅ Todos os styled components estão sendo utilizados!
          </S.SuccessMessage>
        ) : (
          <S.List>
            {validUnusedStyles.map((s, i) => (
              <S.ListItem key={i}>
                <S.ItemContent>
                  <S.ItemName>{s.name}</S.ItemName>
                  <S.ItemDetails>em {s.file}</S.ItemDetails>
                  <S.Badge $variant="danger">Não utilizado</S.Badge>
                </S.ItemContent>
                <S.OpenFileButton 
                  href={getVSCodeUrl(s.file)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📝 Abrir
                </S.OpenFileButton>
              </S.ListItem>
            ))}
          </S.List>
        )
      )}

      <S.SectionHeader 
        onClick={() => setExportsOpen(!exportsOpen)}
        $hasItems={validUnusedExports.length > 0}
      >
        <S.SectionTitle>
          {exportsOpen ? '▼' : '▶'} 📦 Exports (Funções/Constantes/Tipos) ({validUnusedExports.length})
        </S.SectionTitle>
      </S.SectionHeader>
      
      {exportsOpen && (
        validUnusedExports.length === 0 ? (
          <S.SuccessMessage>
            ✅ Todos os exports estão sendo utilizados!
          </S.SuccessMessage>
        ) : (
          <S.List>
            {validUnusedExports.map((e, i) => (
              <S.ListItem key={i}>
                <S.ItemContent>
                  <S.ItemName>{e.name}</S.ItemName>
                  <S.ItemDetails>
                    {e.type} em {e.file}
                  </S.ItemDetails>
                  {e.canBeInternal ? (
                    <S.Badge $variant="warning">Pode ser interno</S.Badge>
                  ) : (
                    <S.Badge $variant="danger">Não utilizado</S.Badge>
                  )}
                </S.ItemContent>
                <S.OpenFileButton 
                  href={getVSCodeUrl(e.file)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📝 Abrir
                </S.OpenFileButton>
              </S.ListItem>
            ))}
          </S.List>
        )
      )}
    </S.PanelContainer>
  );
}
