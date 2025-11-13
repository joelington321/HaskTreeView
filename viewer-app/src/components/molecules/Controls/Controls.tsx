import { ControlsContainer, Label, Button, Select } from './Controls.styles';
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
    <ControlsContainer>
      <Button onClick={onReset}>Resetar Visualização</Button>
      
      <Label htmlFor="layoutSelect">Layout:</Label>
      <Select 
        id="layoutSelect" 
        value={currentLayout} 
        onChange={handleLayoutChange}
      >
        <option value="hierarchical">Hierárquico (Padrão)</option>
        <option value="force-directed">Força-Dirigido</option>
        <option value="circular">Circular</option>
        <option value="radial">Radial</option>
        <option value="layered">Em Camadas</option>
      </Select>
    </ControlsContainer>
  );
}
