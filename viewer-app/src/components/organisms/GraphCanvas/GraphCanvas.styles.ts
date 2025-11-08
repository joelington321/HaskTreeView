import styled from 'styled-components';

export const CanvasContainer = styled.div`
  position: relative;
  width: 100%;
  height: calc(100vh - 160px);
  overflow: auto;
  background-color: #000;

  canvas {
    display: block;
  }

  canvas:active {
    cursor: grabbing !important;
  }
`;
