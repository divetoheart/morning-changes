import { useLocation } from 'react-router-dom';
import { AfterHoursAutumnPort } from './AfterHoursAutumnPort';
import { AfterHoursBluesApp } from './AfterHoursBluesApp';

export function AfterHoursAutumnLeavesApp() {
  const location = useLocation();
  return location.pathname.includes('/12-bar-blues') ? <AfterHoursBluesApp /> : <AfterHoursAutumnPort />;
}
