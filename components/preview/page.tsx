"use client";

import React from 'react';

interface PreviewProps {
  icon: string;
  label: string;
  description: string;
  title: string;
}

const Preview: React.FC<PreviewProps> = ({ icon, label, description, title }) => {
  return (
    <div className="preview">
      <img src={icon} alt={label} className="preview-icon" />
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
};

export default Preview;
