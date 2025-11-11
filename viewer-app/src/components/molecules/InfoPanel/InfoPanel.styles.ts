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

export const OpenInVSCodeButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px 12px;
  background-color: #007acc;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background-color: #005a9e;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 122, 204, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;
