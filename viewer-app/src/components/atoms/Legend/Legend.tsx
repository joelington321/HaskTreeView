import { 
  LegendContainer, 
  Title, 
  LegendItem, 
  LegendCircle, 
  LegendSquare, 
  LegendLine,
  LegendDoubleLine, 
  LegendBox 
} from './Legend.styles';

export function Legend() {
  return (
    <LegendContainer>
      <Title>Legenda</Title>
      <LegendItem>
        <LegendCircle $color="#fff" />
        <span>Nó normal</span>
      </LegendItem>
      <LegendItem>
        <LegendCircle $color="#ff3333" />
        <span>Nó em ciclo</span>
      </LegendItem>
      <LegendItem>
        <LegendSquare />
        <span>Nó isolado (config)</span>
      </LegendItem>
      <LegendItem>
        <LegendLine $color="#fff" />
        <span>Dependência normal</span>
      </LegendItem>
      <LegendItem>
        <LegendDoubleLine $color="#fff" />
        <span>Dependência bidirecional</span>
      </LegendItem>
      <LegendItem>
        <LegendLine $color="#ff3333" />
        <span>Dependência circular</span>
      </LegendItem>
      <LegendItem>
        <LegendBox />
        <span>Árvore desconexa</span>
      </LegendItem>
    </LegendContainer>
  );
}
