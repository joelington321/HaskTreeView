import { useRef, useState, useEffect } from 'react';
import * as S from './WelcomeModal.styles';

interface RecentFile {
  name: string;
  path: string;
  date: string;
}

interface WelcomeModalProps {
  onFileSelect: (file: File) => void;
  onRecentFileSelect: (path: string) => void;
}

export function WelcomeModal({ onFileSelect, onRecentFileSelect }: WelcomeModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  useEffect(() => {
    // Carregar arquivos recentes do localStorage
    const stored = localStorage.getItem('recentFiles');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecentFiles(parsed);
      } catch {
        // Se houver erro, usar defaults
        const defaults: RecentFile[] = [
          {
            name: 'dependencies.json',
            path: '../output/dependencies.json',
            date: new Date().toLocaleString('pt-BR'),
          },
        ];
        setRecentFiles(defaults);
      }
    } else {
      // Adicionar arquivo padrão se não houver nada
      const defaults: RecentFile[] = [
        {
          name: 'dependencies.json',
          path: '../output/dependencies.json',
          date: new Date().toLocaleString('pt-BR'),
        },
      ];
      setRecentFiles(defaults);
    }
  }, []);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      
      // Salvar no localStorage
      const newFile: RecentFile = {
        name: file.name,
        path: URL.createObjectURL(file),
        date: new Date().toLocaleString('pt-BR'),
      };
      
      const updatedRecent = [
        newFile, 
        ...recentFiles.filter((f) => f.name !== file.name)
      ].slice(0, 5);
      
      localStorage.setItem('recentFiles', JSON.stringify(updatedRecent));
      setRecentFiles(updatedRecent);
    }
  };

  return (
    <S.ModalOverlay>
      <S.ModalContent>
        <S.ModalTitle>🌳 Bem-vindo ao HaskTreeView</S.ModalTitle>
        <S.ModalSubtitle>
          Visualize árvores de dependências e analise código não utilizado
        </S.ModalSubtitle>

        <S.Section>
          <S.SectionTitle>📂 Arquivos Recentes</S.SectionTitle>
          {recentFiles.length > 0 ? (
            <S.RecentList>
              {recentFiles.map((file, index) => (
                <S.RecentItem
                  key={index}
                  onClick={() => onRecentFileSelect(file.path)}
                >
                  <S.RecentIcon>📄</S.RecentIcon>
                  <S.RecentInfo>
                    <S.RecentName>{file.name}</S.RecentName>
                    <S.RecentDate>{file.date}</S.RecentDate>
                  </S.RecentInfo>
                </S.RecentItem>
              ))}
            </S.RecentList>
          ) : (
            <S.EmptyState>Nenhum arquivo recente</S.EmptyState>
          )}
        </S.Section>

        <S.Section>
          <S.SectionTitle>📁 Abrir Arquivo</S.SectionTitle>
          <S.ButtonGroup>
            <S.Button $variant="primary" onClick={handleFileClick}>
              📂 Selecionar JSON
            </S.Button>
          </S.ButtonGroup>
          <S.HiddenInput
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
          />
        </S.Section>
      </S.ModalContent>
    </S.ModalOverlay>
  );
}
