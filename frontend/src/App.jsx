import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import EventsPage from './EventsPage';
import EditEvent from './EditEventPage';
import EventSummaryPage from './EventSummaryPage';
import EventRegistrationsPage from './EventRegistrationsPage';
import EventGiftAidPage from './EventGiftAidPage';
import EventCheckInPage from './EventCheckInPage';

import RegistrationEdit from './RegistrationEdit';
import PrivateRoute from './PrivateRoute';
import EventFailedPaymentPage from './EventFailedPaymentPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><EventsPage /></PrivateRoute>} />
         <Route path="/edit/:eventId" element={<PrivateRoute><EditEvent /></PrivateRoute>} />
          <Route path="/summary/:eventId" element={<PrivateRoute><EventSummaryPage /></PrivateRoute>} />
          <Route path="/registrations/:eventId" element={<PrivateRoute><EventRegistrationsPage /></PrivateRoute>} />
          <Route path="/registrations/:eventId/edit/:registrationId" element={<PrivateRoute><RegistrationEdit /></PrivateRoute>} />
          <Route path="/giftaid/:eventId" element={<PrivateRoute><EventGiftAidPage /></PrivateRoute>} />
          <Route path="/failedpayments/:eventId" element={<PrivateRoute><EventFailedPaymentPage /></PrivateRoute>} />
          <Route path="/add-event" element={<PrivateRoute><EditEvent isNew={true} /></PrivateRoute>} />
          <Route path="/checkin/:eventId" element={<PrivateRoute><EventCheckInPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}