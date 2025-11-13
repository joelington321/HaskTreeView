import { useRef } from 'react';
import * as S from './Header.styles';

interface HeaderProps {
  viewMode?: 'tree' | 'unused';
  setViewMode?: (mode: 'tree' | 'unused') => void;
  onFileLoad?: (file: File) => void;
}

export function Header({ viewMode = 'tree', setViewMode, onFileLoad }: HeaderProps) {
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
        {onFileLoad && (
          <>
            <S.FileButton onClick={handleFileButtonClick}>
              📂 Carregar JSON
            </S.FileButton>
            <S.HiddenFileInput
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
            />
          </>
        )}
      </S.ButtonGroup>
    </S.HeaderContainer>
  );
}
