import styled from 'styled-components';

export const PanelContainer = styled.div`
  padding: 24px;
  color: #fff;
  overflow-y: auto;
  height: calc(100vh - 180px);
`;

export const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 24px;
  color: #0066cc;
`;

export const SectionTitle = styled.h3`
  font-size: 18px;
  margin-top: 32px;
  margin-bottom: 16px;
  color: #fff;
  border-bottom: 1px solid #333;
  padding-bottom: 8px;
`;

export const SuccessMessage = styled.div`
  color: #4caf50;
  padding: 12px;
  background-color: rgba(76, 175, 80, 0.1);
  border-radius: 4px;
  margin-bottom: 16px;
`;

export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const ListItem = styled.li`
  padding: 12px;
  margin-bottom: 8px;
  background-color: #1a1a2e;
  border-left: 3px solid #0066cc;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  &:hover {
    background-color: #252541;
  }
`;

export const ItemContent = styled.div`
  flex: 1;
`;

export const ItemName = styled.span`
  font-weight: bold;
  color: #fff;
  font-size: 14px;
`;

export const ItemDetails = styled.span`
  color: #888;
  font-size: 12px;
  margin-left: 8px;
`;

export const Badge = styled.span<{ $variant?: 'warning' | 'info' | 'danger' }>`
  display: inline-block;
  padding: 2px 8px;
  margin-left: 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'warning':
        return `
          background-color: rgba(255, 152, 0, 0.2);
          color: #ff9800;
        `;
      case 'danger':
        return `
          background-color: rgba(244, 67, 54, 0.2);
          color: #f44336;
        `;
      case 'info':
      default:
        return `
          background-color: rgba(33, 150, 243, 0.2);
          color: #2196f3;
        `;
    }
  }}
`;

export const OpenFileButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background-color: #007acc;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background-color: #005a9e;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: #666;
`;

export const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

export const EmptyText = styled.p`
  font-size: 16px;
  color: #888;
`;
