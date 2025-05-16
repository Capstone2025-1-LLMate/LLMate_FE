// src/components/InputButton.js
import React from 'react';
import './InputButton.css';

const InputButton = ({ label, onClick }) => (
  <button className="input-button" onClick={onClick}>
    {label}
  </button>
);

export default InputButton;
