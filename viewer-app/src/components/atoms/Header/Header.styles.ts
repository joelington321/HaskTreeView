import styled from 'styled-components';

export const HeaderContainer = styled.header`
  padding: 20px;
  text-align: center;
  background-color: #111;
  border-bottom: 2px solid #333;
`;

export const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 10px;
  color: #fff;
`;

export const Subtitle = styled.p`
  color: #888;
  font-size: 14px;
`;

export const Logo = styled.img`
  height: 40px; 
`;

export const NavBar = styled.nav`
  margin-top: 10px;
`;

export const ButtonGroup = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 8px;
  justify-content: center;
`;

export const TabButton = styled.button<{ $active: boolean }>`
  padding: 8px 20px;
  background: ${({ $active }) => ($active ? '#0066cc' : '#222')};
  color: #fff;
  border: ${({ $active }) => ($active ? '2px solid #0088ff' : '1px solid #444')};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $active }) => ($active ? '#0077dd' : '#333')};
    border-color: ${({ $active }) => ($active ? '#0099ff' : '#666')};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;