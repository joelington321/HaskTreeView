import { useRef } from 'react';
import { ControlsContainer, Label, FileInput, Button, Select } from './Controls.styles';
import type { LayoutType } from '../../types';

interface ControlsProps {
  onFileLoad: (file: File) => void;
  onReset: () => void;
  onLoadExample: () => void;
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

export function Controls({ 
  onFileLoad, 
  onReset, 
  onLoadExample,
  currentLayout,
  onLayoutChange 
}: ControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileLoad(file);
    }
  };

  const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onLayoutChange(e.target.value as LayoutType);
  };

  return (
    <ControlsContainer>
      <Label htmlFor="fileInput">Carregar JSON:</Label>
      <FileInput
        ref={fileInputRef}
        type="file"
        id="fileInput"
        accept=".json"
        onChange={handleFileChange}
      />
      <Button onClick={onReset}>Resetar Visualização</Button>
      <Button onClick={onLoadExample}>Carregar Exemplo</Button>
      
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
