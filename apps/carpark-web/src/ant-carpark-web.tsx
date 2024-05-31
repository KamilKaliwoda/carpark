import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import Root from "./root.component";
import './styles/Global.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <Root />
  </StrictMode>
);
