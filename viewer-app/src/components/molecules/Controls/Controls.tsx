import * as S from './Controls.styles';
import type { LayoutType } from '../../../types';

interface ControlsProps {
  onReset: () => void;
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

export function Controls({ 
  onReset, 
  currentLayout,
  onLayoutChange 
}: ControlsProps) {
  const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onLayoutChange(e.target.value as LayoutType);
  };

  return (
    <S.ControlsContainer>
      <S.Button onClick={onReset}>Resetar Visualização</S.Button>
      
      <S.Label htmlFor="layoutSelect">Layout:</S.Label>
      <S.Select 
        id="layoutSelect" 
        value={currentLayout} 
        onChange={handleLayoutChange}
      >
        <option value="hierarchical">Hierárquico (Padrão)</option>
        <option value="force-directed">Força-Dirigido</option>
        <option value="circular">Circular</option>
        <option value="radial">Radial</option>
        <option value="layered">Em Camadas</option>
      </S.Select>
    </S.ControlsContainer>
  );
}
