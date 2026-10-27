// src/context/CookieContext.jsx
import { createContext, useContext, useState } from 'react';

const CookieContext = createContext();

export function CookieProvider({ children }) {
  const [modalOpen, setModalOpen] = useState(false);
  const openCookieModal = () => setModalOpen(true);
  const closeCookieModal = () => setModalOpen(false);

  return (
    <CookieContext.Provider value={{ modalOpen, openCookieModal, closeCookieModal }}>
      {children}
    </CookieContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCookie() {
  return useContext(CookieContext);
}