import * as S from './Legend.styles';

export function Legend() {
  return (
    <S.LegendContainer>
      <S.Title>Legenda</S.Title>
      <S.LegendItem>
        <S.LegendCircle $color="#fff" />
        <span>Nó normal</span>
      </S.LegendItem>
      <S.LegendItem>
        <S.LegendCircle $color="#ff3333" />
        <span>Nó em ciclo</span>
      </S.LegendItem>
      <S.LegendItem>
        <S.LegendSquare />
        <span>Nó isolado (config)</span>
      </S.LegendItem>
      <S.LegendItem>
        <S.LegendLine $color="#fff" />
        <span>Dependência normal</span>
      </S.LegendItem>
      <S.LegendItem>
        <S.LegendDoubleLine $color="#fff" />
        <span>Dependência bidirecional</span>
      </S.LegendItem>
      <S.LegendItem>
        <S.LegendLine $color="#ff3333" />
        <span>Dependência circular</span>
      </S.LegendItem>
      <S.LegendItem>
        <S.LegendBox />
        <span>Árvore desconexa</span>
      </S.LegendItem>
    </S.LegendContainer>
  );
}
