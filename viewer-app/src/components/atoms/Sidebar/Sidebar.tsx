import { useRef, useState } from 'react';
import * as S from './Sidebar.styles';

interface SidebarProps {
  viewMode?: 'tree' | 'unused';
  setViewMode?: (mode: 'tree' | 'unused') => void;
  onFileLoad?: (file: File) => void;
}

export function Sidebar({ viewMode = 'tree', setViewMode, onFileLoad }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileLoad) {
      onFileLoad(file);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <S.SidebarContainer $isExpanded={isExpanded}>
        <S.ToggleButton onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? '◀' : '▶'}
        </S.ToggleButton>

        <S.SidebarContent>
          <S.LogoSection>
            <S.IconWrapper title="HaskTreeView">🌳</S.IconWrapper>
            {isExpanded && <S.AppTitle>HaskTreeView</S.AppTitle>}
          </S.LogoSection>

          <S.Divider />

          <S.MenuSection>
            <S.MenuItem
              $active={viewMode === 'tree'}
              onClick={() => setViewMode && setViewMode('tree')}
              title="Visualizar Árvore"
            >
              <S.IconWrapper>🌲</S.IconWrapper>
              {isExpanded && <S.MenuText>Árvore</S.MenuText>}
            </S.MenuItem>

            <S.MenuItem
              $active={viewMode === 'unused'}
              onClick={() => setViewMode && setViewMode('unused')}
              title="Ver Não Utilizados"
            >
              <S.IconWrapper>🔍</S.IconWrapper>
              {isExpanded && <S.MenuText>Não Utilizados</S.MenuText>}
            </S.MenuItem>

            {onFileLoad && (
              <S.MenuItem onClick={handleFileButtonClick} title="Carregar JSON">
                <S.IconWrapper>📂</S.IconWrapper>
                {isExpanded && <S.MenuText>Carregar JSON</S.MenuText>}
                <S.HiddenFileInput
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                />
              </S.MenuItem>
            )}
          </S.MenuSection>
        </S.SidebarContent>
      </S.SidebarContainer>

      {isExpanded && <S.Overlay onClick={() => setIsExpanded(false)} />}
    </>
  );
}
