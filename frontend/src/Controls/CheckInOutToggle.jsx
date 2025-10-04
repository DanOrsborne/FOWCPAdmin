import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';

const CheckInOutControl = ({ reg, loadingId, handleCheckInOut }) => {
  const isLoading = loadingId === reg.CustomerId;

  if (isLoading) {
    return <CircularProgress size={20} />;
  }

  return (
    <>
      {reg.checkedIn ? (
        <CheckBoxIcon
          sx={{ color: loadingId !== null ? 'grey' : 'green' }}
          onClick={() => {
            if (loadingId === null) handleCheckInOut(reg.CustomerId, 'checkedIn', false, true);
          }}
        />
      ) : (
        <CheckBoxOutlineBlankIcon
          sx={{ color: loadingId !== null ? 'grey' : 'black' }}
          onClick={() => {
            if (loadingId === null) handleCheckInOut(reg.CustomerId, 'checkedIn', true, false);
          }}
        />
      )}

      {reg.checkedOut ? (
        <DisabledByDefaultIcon
          sx={{ color: loadingId !== null ? 'grey' : 'red' }}
          onClick={() => {
            if (loadingId === null) handleCheckInOut(reg.CustomerId, 'checkedOut', false, true);
          }}
        />
      ) : (
        <CheckBoxOutlineBlankIcon
          sx={{ color: loadingId !== null ? 'grey' : 'black' }}
          onClick={() => {
            if (loadingId === null) handleCheckInOut(reg.CustomerId, 'checkedOut', true, false, reg.checkedIn);
          }}
        />
      )}
    </>
  );
};

export default CheckInOutControl;
