import React from 'react';
import './Header.css';

function Header({ title }) {
  return (
    <div className="header">
      <h1>{title}</h1>
    </div>
  );
}

export default Header;