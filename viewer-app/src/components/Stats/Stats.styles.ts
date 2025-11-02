import styled from 'styled-components';

export const StatsContainer = styled.div`
  position: fixed;
  top: 180px;
  right: 20px;
  background-color: rgba(17, 17, 17, 0.95);
  border: 1px solid #444;
  border-radius: 8px;
  padding: 15px;
  min-width: 200px;
  color: #fff;
`;

export const Title = styled.h3`
  font-size: 14px;
  margin-bottom: 10px;
  color: #0066cc;
`;

export const Text = styled.p`
  font-size: 12px;
  margin: 5px 0;
  color: #ccc;
`;

export const Label = styled.span`
  color: #888;
  font-weight: bold;
`;

export const CyclesWarning = styled.span`
  color: #ff3333;
`;
