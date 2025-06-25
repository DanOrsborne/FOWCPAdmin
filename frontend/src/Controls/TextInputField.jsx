import React from 'react';
import { Typography, TextField } from '@mui/material';

export default function TextInputField({ label, value, onChange, type, fullWidth = true, margin = "normal" }) {

const handleInputChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="mb-10">
      <Typography variant="caption" >{label}</Typography>
      <TextField  sx={{ mt: 0, mb: 0 }}
        value={value || ''}
        onChange={handleInputChange}
        fullWidth={fullWidth}
        margin={margin}
        type={type}
        
      />
    </div>
  );
}
