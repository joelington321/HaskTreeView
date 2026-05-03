import { GraphNode } from '@/types';
import { getFileName } from '@/utils/helpers';
import * as S from './InfoPanel.styles';

interface InfoPanelProps {
  node: GraphNode | null;
  nodes: GraphNode[];
  projectRoot?: string;
}

export function InfoPanel({ node, nodes, projectRoot }: InfoPanelProps) {
  if (!node) return null;

  const getFileNames = (ids: string[]): string => {
    if (ids.length === 0) return 'Nenhum';
    
    return ids
      .map((id) => {
        const n = nodes.find((n) => n.id === id);
        return n ? getFileName(n.filePath) : id;
      })
      .join(', ');
  };

  const circularWarning = node.isCircular ? ' ⚠️ (Dependência Circular)' : '';

  // Gerar URL do VS Code
  const getVSCodeUrl = (filePath: string): string => {
    if (!projectRoot) {
      return `vscode://file/${filePath}`;
    }
    
    // Normalizar barras e construir caminho absoluto
    const normalizedRoot = projectRoot.replace(/\\/g, '/');
    const normalizedFile = filePath.replace(/\\/g, '/');
    const absolutePath = `${normalizedRoot}/${normalizedFile}`;
    
    return `vscode://file/${absolutePath}`;
  };

  return (
    <S.InfoPanelContainer>
      <S.Title $isCircular={node.isCircular}>
        Informações do Nó{circularWarning}
      </S.Title>
      <S.Text>
        <S.Label>Arquivo:</S.Label> {node.filePath}
      </S.Text>
      <S.Text>
        <S.Label>Importa:</S.Label> {getFileNames(node.imports)}
      </S.Text>
      <S.Text>
        <S.Label>Importado por:</S.Label> {getFileNames(node.importedBy)}
      </S.Text>
      
      <S.OpenInVSCodeButton 
        href={getVSCodeUrl(node.filePath)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>📝</span> Abrir no VS Code
      </S.OpenInVSCodeButton>
    </S.InfoPanelContainer>
  );
}
