/**
 * Aplica opacidade a uma cor hex, rgb ou rgba
 */
export function applyOpacity(color: string, opacity: number): string {
  // Se já é rgba, ajustar opacidade
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/g, opacity + ')');
  }
  
  // Se é rgb, converter para rgba
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', ', ' + opacity + ')');
  }
  
  // Converter hex para rgba
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    let r: number, g: number, b: number;
    
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else {
      r = parseInt(hex.substr(0, 2), 16);
      g = parseInt(hex.substr(2, 2), 16);
      b = parseInt(hex.substr(4, 2), 16);
    }
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  return color;
}

/**
 * Extrai o nome do arquivo de um caminho completo
 */
export function getFileName(filePath: string): string {
  return filePath.split(/[\/\\]/).pop() || filePath;
}

/**
 * Formata uma data ISO para formato legível
 */
export function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleString('pt-BR');
  } catch {
    return isoDate;
  }
}
