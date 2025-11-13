import styled from 'styled-components';

export const SidebarContainer = styled.aside<{ $isExpanded: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: ${({ $isExpanded }) => ($isExpanded ? '250px' : '60px')};
  background-color: #111;
  border-right: 2px solid #333;
  transition: width 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const ToggleButton = styled.button`
  position: absolute;
  right: -12px;
  top: 20px;
  width: 24px;
  height: 24px;
  background: #333;
  border: 2px solid #444;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: all 0.2s ease;
  z-index: 1001;

  &:hover {
    background: #444;
    border-color: #666;
    transform: scale(1.1);
  }
`;

export const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px 0;
`;

export const LogoSection = styled.div`
  display: flex;
  align-items: center;
  padding: 0 15px;
  margin-bottom: 10px;
  gap: 12px;
`;

export const IconWrapper = styled.div`
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  max-width: 30px;
`;

export const AppTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  margin: 0;
`;

export const Divider = styled.div`
  height: 2px;
  background: #333;
  margin: 15px 10px;
`;

export const MenuSection = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 10px;
`;

export const MenuItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 5px;
  background: ${({ $active }) => ($active ? '#0066cc' : 'transparent')};
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: ${({ $active }) => ($active ? '#0077dd' : '#222')};
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const MenuText = styled.span`
  white-space: nowrap;
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;
