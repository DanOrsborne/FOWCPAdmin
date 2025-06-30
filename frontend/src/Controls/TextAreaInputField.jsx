import React from 'react';
import { Typography } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function TextAreaInputField({ label, value, onChange }) {

  const handleInputChange = (content) => {
    if (onChange) {
      onChange(content);
    }
  };

  return (
    <div className="mb-10">
      <Typography variant="caption" >{label}</Typography>
      <ReactQuill
        value={value}
        onChange={handleInputChange}

      />
    </div>
  );
}


