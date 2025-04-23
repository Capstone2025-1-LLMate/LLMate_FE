// src/components/InputBubble.js
import React from 'react';
import './InputBubble.css';


const InputBubble = ({placeHolder}) => (
  <div className="input-bubble">
    <textarea
      className="input-field"
      placeholder= {placeHolder}
    />
    <button className="submit-arrow" aria-label="제출" />
 </div>
);


export default InputBubble;
