import './Legend.css';

export function Legend() {
  return (
    <div className="legend">
      <h3>Legenda</h3>
      <div className="legend-item">
        <div className="legend-circle" style={{ backgroundColor: '#fff' }}></div>
        <span>Nó normal</span>
      </div>
      <div className="legend-item">
        <div className="legend-circle" style={{ backgroundColor: '#ff3333' }}></div>
        <span>Nó em ciclo</span>
      </div>
      <div className="legend-item">
        <div className="legend-line" style={{ backgroundColor: '#fff' }}></div>
        <span>Dependência normal</span>
      </div>
      <div className="legend-item">
        <div className="legend-line" style={{ backgroundColor: '#ff3333' }}></div>
        <span>Dependência circular</span>
      </div>
      <div className="legend-item">
        <div
          style={{
            width: '30px',
            height: '16px',
            marginRight: '10px',
            border: '2px dashed rgba(0, 150, 255, 0.8)',
            borderRadius: '4px',
            backgroundColor: 'rgba(0, 150, 255, 0.2)',
          }}
        ></div>
        <span>Árvore desconexa</span>
      </div>
    </div>
  );
}
