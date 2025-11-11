import React from 'react';

import * as S from './UnusedPanel.styles';

export interface UnusedPanelProps {
  unusedStyles: Array<{ name: string; file: string }>;
  unusedExports: Array<{ name: string; type: string; file: string; canBeInternal?: boolean }>;
}

export function UnusedPanel({ unusedStyles, unusedExports }: UnusedPanelProps) {
  const totalIssues = unusedStyles.length + unusedExports.length;

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
      
      <S.SectionTitle>
        🎨 Styled Components ({unusedStyles.length})
      </S.SectionTitle>
      {unusedStyles.length === 0 ? (
        <S.SuccessMessage>
          ✅ Todos os styled components estão sendo utilizados!
        </S.SuccessMessage>
      ) : (
        <S.List>
          {unusedStyles.map((s, i) => (
            <S.ListItem key={i}>
              <S.ItemName>{s.name}</S.ItemName>
              <S.ItemDetails>em {s.file}</S.ItemDetails>
              <S.Badge $variant="danger">Não utilizado</S.Badge>
            </S.ListItem>
          ))}
        </S.List>
      )}

      <S.SectionTitle>
        📦 Exports (Funções/Constantes/Tipos) ({unusedExports.length})
      </S.SectionTitle>
      {unusedExports.length === 0 ? (
        <S.SuccessMessage>
          ✅ Todos os exports estão sendo utilizados!
        </S.SuccessMessage>
      ) : (
        <S.List>
          {unusedExports.map((e, i) => (
            <S.ListItem key={i}>
              <S.ItemName>{e.name}</S.ItemName>
              <S.ItemDetails>
                {e.type} em {e.file}
              </S.ItemDetails>
              {e.canBeInternal ? (
                <S.Badge $variant="warning">Pode ser interno</S.Badge>
              ) : (
                <S.Badge $variant="danger">Não utilizado</S.Badge>
              )}
            </S.ListItem>
          ))}
        </S.List>
      )}
    </S.PanelContainer>
  );
}
