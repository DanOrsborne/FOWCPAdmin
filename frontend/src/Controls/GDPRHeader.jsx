import { Alert, Typography, Paper } from '@mui/material';

export default function GDPRNotice() {
  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Alert severity="warning" sx={{ mb: 1 }}>
        <Typography variant="h6" gutterBottom>
          GDPR Notice – Data Handling Instructions
        </Typography>
        <Typography variant="body2" gutterBottom>
          This sign-in sheet contains personal information collected for event attendance and safety purposes. It is your responsibility to handle this information in accordance with UK GDPR and data protection guidelines.
        </Typography>
        <ul style={{ marginTop: 8, marginBottom: 8 }}>
          <li><Typography variant="body2">Do not photograph, share, or copy this information.</Typography></li>
          <li><Typography variant="body2">Keep the sheet secure and visible only to authorised event volunteers.</Typography></li>
          <li><Typography variant="body2">At the end of the event, this sheet must be securely destroyed (e.g., shredded).</Typography></li>
        </ul>
        <Typography variant="body2">
          By using this sign-in sheet, you acknowledge your responsibility to protect the privacy of the individuals listed.
        </Typography>
      </Alert>
    </Paper>
  );
}
