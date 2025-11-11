import * as S from './Header.styles';

interface HeaderProps {
  viewMode?: 'tree' | 'unused';
  setViewMode?: (mode: 'tree' | 'unused') => void;
}

export function Header({ viewMode = 'tree', setViewMode }: HeaderProps) {
  return (
    <S.HeaderContainer>
      <S.Title>🌳 HaskTreeView</S.Title>
      <S.Subtitle>Visualizador de Árvore de Dependências</S.Subtitle>
      <S.ButtonGroup>
        <S.TabButton
          $active={viewMode === 'tree'}
          onClick={() => setViewMode && setViewMode('tree')}
        >
          🌲 Visualizar Árvore
        </S.TabButton>
        <S.TabButton
          $active={viewMode === 'unused'}
          onClick={() => setViewMode && setViewMode('unused')}
        >
          🔍 Ver Não Utilizados
        </S.TabButton>
      </S.ButtonGroup>
    </S.HeaderContainer>
  );
}
