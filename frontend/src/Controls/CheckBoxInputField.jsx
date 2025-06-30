import React from 'react';
import { Typography, FormControlLabel, Checkbox } from '@mui/material';

export default function CheckBoxInputField({ label, value, onChange }) {

  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <div className="mb-10">
      <Typography variant="caption">{label}</Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={value || false}
            onChange={handleInputChange}
          />
        }

      />





    </div>
  );
}
