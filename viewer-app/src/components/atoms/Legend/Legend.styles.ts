import styled from 'styled-components';

export const LegendContainer = styled.div`
  position: fixed;
  bottom: 20px;
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

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin: 8px 0;
  font-size: 12px;
`;

export const LegendCircle = styled.div<{ $color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 10px;
  border: 2px solid #000;
  background-color: ${props => props.$color};
`;

export const LegendSquare = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 10px;
  background-color: #888;
`;
export const LegendTest= styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 10px;
  background-color: #888;
`;

export const LegendLine = styled.div<{ $color: string }>`
  width: 30px;
  height: 2px;
  margin-right: 10px;
  background-color: ${props => props.$color};
`;

export const LegendBox = styled.div`
  width: 30px;
  height: 16px;
  margin-right: 10px;
  border: 2px dashed rgba(0, 150, 255, 0.8);
  border-radius: 4px;
  background-color: rgba(0, 150, 255, 0.2);
`;
