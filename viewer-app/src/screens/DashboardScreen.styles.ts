import styled from 'styled-components';

export const ScreenContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  background: #1a1a2e;
  overflow: hidden;
`;

export const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 60px; /* Espaço para a sidebar colapsada */
  overflow: hidden;
`;
