import { GraphStats } from '@/types';
import { formatDate } from '@/utils/helpers';
import { StatsContainer, Title, Text, Label, CyclesWarning } from './Stats.styles';

interface StatsProps {
  stats: GraphStats;
}

export function Stats({ stats }: StatsProps) {
  return (
    <StatsContainer>
      <Title>Estatísticas</Title>
      <Text>
        <Label>Projeto:</Label> {stats.projectName}
      </Text>
      <Text>
        <Label>Total de arquivos:</Label> {stats.totalFiles}
      </Text>
      <Text>
        <Label>Total de conexões:</Label> {stats.totalConnections}
      </Text>
      <Text>
        <Label>Árvores desconexas:</Label> {stats.disconnectedTrees}
      </Text>
      <Text>
        <Label>Ciclos detectados:</Label>{' '}
        {stats.cyclesDetected > 0 ? (
          <CyclesWarning>{stats.cyclesDetected}</CyclesWarning>
        ) : (
          stats.cyclesDetected
        )}
      </Text>
      <Text>
        <Label>Analisado em:</Label> {formatDate(stats.analyzedAt)}
      </Text>
    </StatsContainer>
  );
}
