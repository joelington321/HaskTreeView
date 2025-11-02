import { useRef } from 'react';
import { ControlsContainer, Label, FileInput, Button } from './Controls.styles';

interface ControlsProps {
  onFileLoad: (file: File) => void;
  onReset: () => void;
  onLoadExample: () => void;
}

export function Controls({ onFileLoad, onReset, onLoadExample }: ControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileLoad(file);
    }
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
    </ControlsContainer>
  );
}
