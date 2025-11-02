import { GraphNode } from '@/types';
import { getFileName } from '@/utils/helpers';
import './InfoPanel.css';

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
    <div className="info-panel">
      <h3 className={node.isCircular ? 'circular' : ''}>
        Informações do Nó{circularWarning}
      </h3>
      <p>
        <span className="label">Arquivo:</span> {node.filePath}
      </p>
      <p>
        <span className="label">Importa:</span> {getFileNames(node.imports)}
      </p>
      <p>
        <span className="label">Importado por:</span> {getFileNames(node.importedBy)}
      </p>
    </div>
  );
}
