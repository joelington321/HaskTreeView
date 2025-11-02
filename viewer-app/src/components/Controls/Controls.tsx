import { useRef } from 'react';
import './Controls.css';

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
    <div className="controls">
      <label htmlFor="fileInput">Carregar JSON:</label>
      <input
        ref={fileInputRef}
        type="file"
        id="fileInput"
        accept=".json"
        onChange={handleFileChange}
      />
      <button onClick={onReset}>Resetar Visualização</button>
      <button onClick={onLoadExample}>Carregar Exemplo</button>
    </div>
  );
}
