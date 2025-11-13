import styled from 'styled-components';

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

export const ModalContent = styled.div`
  background-color: #1a1a2e;
  border-radius: 12px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
`;

export const ModalTitle = styled.h2`
  font-size: 28px;
  margin-bottom: 8px;
  color: #fff;
  text-align: center;
`;

export const ModalSubtitle = styled.p`
  color: #888;
  text-align: center;
  margin-bottom: 32px;
  font-size: 14px;
`;

export const Section = styled.div`
  margin-bottom: 32px;
`;

export const SectionTitle = styled.h3`
  font-size: 16px;
  color: #0066cc;
  margin-bottom: 16px;
  font-weight: 600;
`;

export const RecentList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
`;

export const RecentItem = styled.li`
  padding: 12px 16px;
  background-color: #252541;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid transparent;

  &:hover {
    background-color: #2d2d4a;
    border-color: #0066cc;
    transform: translateX(4px);
  }
`;

export const RecentIcon = styled.span`
  font-size: 20px;
`;

export const RecentInfo = styled.div`
  flex: 1;
`;

export const RecentName = styled.div`
  color: #fff;
  font-weight: 500;
  font-size: 14px;
`;

export const RecentDate = styled.div`
  color: #888;
  font-size: 12px;
  margin-top: 2px;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 24px;
  color: #666;
  font-size: 14px;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${({ $variant = 'primary' }) =>
    $variant === 'primary'
      ? `
    background-color: #228B22;
    color: #fff;
    border: 1px solid #32CD32;
    
    &:hover {
      background-color: #2E8B57;
      border-color: #3CB371;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(34, 139, 34, 0.4);
    }
  `
      : `
    background-color: #333;
    color: #fff;
    
    &:hover {
      background-color: #444;
    }
  `}

  &:active {
    transform: translateY(0);
  }
`;

export const HiddenInput = styled.input`
  display: none;
`;
