import { GraphStats } from '@/types';
import { formatDate } from '@/utils/helpers';
import * as S from './Stats.styles';

interface StatsProps {
  stats: GraphStats;
}

export function Stats({ stats }: StatsProps) {
  return (
    <S.StatsContainer>
      <S.Title>Estatísticas</S.Title>
      <S.Text>
        <S.Label>Projeto:</S.Label> {stats.projectName}
      </S.Text>
      <S.Text>
        <S.Label>Total de arquivos:</S.Label> {stats.totalFiles}
      </S.Text>
      <S.Text>
        <S.Label>Total de conexões:</S.Label> {stats.totalConnections}
      </S.Text>
      <S.Text>
        <S.Label>Árvores desconexas:</S.Label> {stats.disconnectedTrees}
      </S.Text>
      <S.Text>
        <S.Label>Ciclos detectados:</S.Label>{' '}
        {stats.cyclesDetected > 0 ? (
          <S.CyclesWarning>{stats.cyclesDetected}</S.CyclesWarning>
        ) : (
          stats.cyclesDetected
        )}
      </S.Text>
      <S.Text>
        <S.Label>Analisado em:</S.Label> {formatDate(stats.analyzedAt)}
      </S.Text>
    </S.StatsContainer>
  );
}
