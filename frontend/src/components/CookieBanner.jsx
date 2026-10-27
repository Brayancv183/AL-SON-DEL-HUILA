import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiCookieDuotone, PiGearDuotone } from 'react-icons/pi';
import CookieModal from './CookieModal';
import { useCookie } from '../context/CookieContext';
import styles from './CookieBanner.module.css';

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem('cookieConsent'));
  const { modalOpen, openCookieModal, closeCookieModal } = useCookie();

  const acceptAll = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({ necessary: true, analytics: true, marketing: true, accepted: true, date: new Date().toISOString() }));
    setVisible(false);
  };

  const rejectAll = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({ necessary: true, analytics: false, marketing: false, accepted: true, date: new Date().toISOString() }));
    setVisible(false);
  };

  const savePreferences = (prefs) => {
    localStorage.setItem('cookieConsent', JSON.stringify({ necessary: true, analytics: prefs.analytics, marketing: prefs.marketing, accepted: true, date: new Date().toISOString() }));
    setVisible(false);
    closeCookieModal();
  };

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div className={styles.banner} initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}>
            <div className={styles.container}>
              <div className={styles.icon}><PiCookieDuotone size={32} /></div>
              <div className={styles.content}>
                <h3 className={styles.title}>Uso de cookies</h3>
                <p className={styles.text}>
                  Utilizamos cookies técnicas necesarias para el funcionamiento de la plataforma.
                  Puedes aceptar todas o configurar tus preferencias.
                  Más información en nuestra <a href="/privacidad" target="_blank">Política de Privacidad</a>.
                </p>
                <div className={styles.actions}>
                  <button className={styles.btnSettings} onClick={openCookieModal}><PiGearDuotone size={16} /> Configurar</button>
                  <button className={styles.btnSecondary} onClick={rejectAll}>Rechazar</button>
                  <button className={styles.btnPrimary} onClick={acceptAll}>Aceptar todas</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <CookieModal isOpen={modalOpen} onClose={closeCookieModal} onSave={savePreferences} />
    </>
  );
}