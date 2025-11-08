import styled from 'styled-components';

export const InfoPanelContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  background-color: rgba(17, 17, 17, 0.95);
  border: 1px solid #444;
  border-radius: 8px;
  padding: 15px;
  max-width: 300px;
  color: #fff;
`;

export const Title = styled.h3<{ $isCircular?: boolean }>`
  font-size: 16px;
  margin-bottom: 10px;
  color: ${props => props.$isCircular ? '#ff3333' : '#0066cc'};
`;

export const Text = styled.p`
  font-size: 13px;
  margin: 5px 0;
  color: #ccc;
`;

export const Label = styled.span`
  color: #888;
  font-weight: bold;
`;
