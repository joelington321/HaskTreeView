import { GraphNode } from '@/types';
import { getFileName } from '@/utils/helpers';
import { InfoPanelContainer, Title, Text, Label, OpenInVSCodeButton } from './InfoPanel.styles';

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
    <InfoPanelContainer>
      <Title $isCircular={node.isCircular}>
        Informações do Nó{circularWarning}
      </Title>
      <Text>
        <Label>Arquivo:</Label> {node.filePath}
      </Text>
      <Text>
        <Label>Importa:</Label> {getFileNames(node.imports)}
      </Text>
      <Text>
        <Label>Importado por:</Label> {getFileNames(node.importedBy)}
      </Text>
      
      <OpenInVSCodeButton 
        href={getVSCodeUrl(node.filePath)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>📝</span> Abrir no VS Code
      </OpenInVSCodeButton>
    </InfoPanelContainer>
  );
}
