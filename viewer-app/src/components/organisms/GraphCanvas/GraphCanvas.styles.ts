import styled from 'styled-components';

export const CanvasContainer = styled.div`
  position: relative;
  width: 100%;
  flex: 1;
  overflow: auto;
  background-color: #000;

  canvas {
    display: block;
  }

  canvas:active {
    cursor: grabbing !important;
  }
`;
