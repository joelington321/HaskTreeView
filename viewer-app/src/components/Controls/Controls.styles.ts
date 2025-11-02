import styled from 'styled-components';

export const ControlsContainer = styled.div`
  padding: 15px;
  background-color: #111;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: center;
  gap: 15px;
  align-items: center;
`;

export const Label = styled.label`
  color: #fff;
  font-size: 14px;
`;

export const FileInput = styled.input`
  padding: 8px 15px;
  background-color: #222;
  color: #fff;
  border: 1px solid #444;
  border-radius: 4px;
  cursor: pointer;

  &::file-selector-button {
    background-color: #0066cc;
    color: #fff;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 10px;
    transition: background-color 0.3s;

    &:hover {
      background-color: #0052a3;
    }
  }
`;

export const Button = styled.button`
  padding: 8px 20px;
  background-color: #0066cc;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0052a3;
  }
`;
