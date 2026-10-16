// Iconos SVG reutilizados en el panel, extraídos del diseño de Acuerdo Alquiler.

export function IconGrid(props: { className?: string }) {
  return (
    <svg {...props} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="10" width="8" height="11" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

export function IconBuilding(props: { className?: string }) {
  return (
    <svg {...props} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="12" height="18" rx="1" /><path d="M16 21v-6h4v6" />
    </svg>
  );
}

export function IconUsers(props: { className?: string }) {
  return (
    <svg {...props} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" /><path d="M4.5 20.5c1.5-4 4-6 7.5-6s6 2 7.5 6" />
    </svg>
  );
}

export function IconCard(props: { className?: string }) {
  return (
    <svg {...props} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" /><line x1="2.5" y1="9.5" x2="21.5" y2="9.5" />
    </svg>
  );
}

export function IconGear(props: { className?: string }) {
  return (
    <svg {...props} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.2" /><path d="M12 3v2.4M12 18.6V21M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M3 12h2.4M18.6 12H21M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7" />
    </svg>
  );
}

export function IconPlus(props: { className?: string }) {
  return (
    <svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function IconAlert(props: { className?: string }) {
  return (
    <svg {...props} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" /><path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function IconBank(props: { className?: string }) {
  return (
    <svg {...props} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10.5l8-6 8 6" /><path d="M5.5 10.5v8M18.5 10.5v8" /><path d="M3 21h18" /><path d="M9 14.5v3M15 14.5v3" />
    </svg>
  );
}

export function IconHelp(props: { className?: string }) {
  return (
    <svg {...props} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.5" /><path d="M9.3 9.3a2.8 2.8 0 1 1 3.6 2.7c-.8.3-1.4 1-1.4 1.9v.3" /><line x1="12" y1="17" x2="12" y2="17.1" />
    </svg>
  );
}

export function IconShield(props: { className?: string }) {
  return (
    <svg {...props} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5 5 6.5v5.2c0 4.6 3 7.9 7 8.8 4-.9 7-4.2 7-8.8V6.5L12 3.5Z" /><path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

export function IconTrash(props: { className?: string }) {
  return (
    <svg {...props} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16" /><path d="M9.5 7V4.8c0-.4.3-.8.8-.8h3.4c.5 0 .8.4.8.8V7" /><path d="M6.2 7l.9 12.2c.1.9.8 1.8 1.8 1.8h6.2c1 0 1.7-.9 1.8-1.8L17.8 7" /><path d="M10 11v6M14 11v6" />
    </svg>
  );
}
