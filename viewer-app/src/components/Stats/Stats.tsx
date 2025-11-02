import { GraphStats } from '@/types';
import { formatDate } from '@/utils/helpers';
import './Stats.css';

interface StatsProps {
  stats: GraphStats;
}

export function Stats({ stats }: StatsProps) {
  return (
    <div className="stats">
      <h3>Estatísticas</h3>
      <p>
        <span className="label">Projeto:</span> {stats.projectName}
      </p>
      <p>
        <span className="label">Total de arquivos:</span> {stats.totalFiles}
      </p>
      <p>
        <span className="label">Total de conexões:</span> {stats.totalConnections}
      </p>
      <p>
        <span className="label">Árvores desconexas:</span> {stats.disconnectedTrees}
      </p>
      <p>
        <span className="label">Ciclos detectados:</span>{' '}
        <span className={stats.cyclesDetected > 0 ? 'cycles-warning' : ''}>
          {stats.cyclesDetected}
        </span>
      </p>
      <p>
        <span className="label">Analisado em:</span> {formatDate(stats.analyzedAt)}
      </p>
    </div>
  );
}
