import { GraphNode } from '@/types';
import { getFileName } from '@/utils/helpers';
import { InfoPanelContainer, Title, Text, Label } from './InfoPanel.styles';

interface InfoPanelProps {
  node: GraphNode | null;
  nodes: GraphNode[];
}

export function InfoPanel({ node, nodes }: InfoPanelProps) {
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
    </InfoPanelContainer>
  );
}
