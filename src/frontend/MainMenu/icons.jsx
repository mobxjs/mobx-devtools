import React from 'react';

export const ChangesIcon = () => (
  <svg
    baseProfile="basic"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="-3.5 17.5 16 16"
  >
    <g fill="var(--light-text-color)">
      <path d="M10.75 19.79h-12.6c-.36 0-.65-.288-.65-.645 0-.355.29-.645.65-.645h12.6c.36 0 .65.29.65.645 0 .357-.29.646-.65.646zM10.75 32.5h-12.6c-.36 0-.65-.29-.65-.646s.29-.646.65-.646h12.6c.36 0 .65.29.65.646s-.29.646-.65.646z" />
      <path d="M10.75 21.676H6.708v1.292h4.042c.36 0 .65-.29.65-.646s-.29-.646-.65-.646zM2.193 21.676H-1.85c-.36 0-.65.29-.65.646s.29.646.65.646h4.042v-1.292z" />
      <path d="M.306 28.03H-1.85c-.36 0-.65.29-.65.647s.29.645.65.645h3.463l-1.307-1.29zM10.75 28.03H8.593l-1.308 1.293h3.465c.36 0 .65-.29.65-.646s-.29-.646-.65-.646z" />
    </g>
    <path stroke="var(--primary-color)" fill="none" strokeWidth="2" d="M4.45 21.187V26.2" />
    <path fill="var(--primary-color)" d="M9.067 25.585H-.167l4.617 4.582" />
  </svg>
);

export const TimerIcon = () => (
  <svg
    baseProfile="basic"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="-1.5 19.5 16 16"
  >
    <circle fill="var(--primary-color)" cx="6.5" cy="28" r="1.2" />
    <path fill="none" stroke="var(--primary-color)" strokeWidth="1.4" d="M6.5 28v-6" />
    <circle
      fill="none"
      stroke="var(--light-text-color)"
      strokeWidth="1.6"
      cx="6.5"
      cy="28"
      r="6.75"
    />
    <path
      fill="var(--light-text-color)"
      d="M5.375 19.5h2.25v1.688h-2.25zM12.55 20.175l-.788.788.338.337-.788.9.788.788.9-.787.337.34.788-.79"
    />
    <path fill="none" d="M-1.125 19.5h15.25v15.926h-15.25z" />
  </svg>
);

export const MSTIcon = () => (
  <svg
    baseProfile="basic"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    strokeWidth="1.6"
    fill="none"
    strokeMiterlimit="10"
  >
    <g stroke="var(--light-text-color)">
      <circle cx="2.5" cy="12.5" r="1.5" />
      <circle cx="13.5" cy="12.5" r="1.5" />
      <path d="M2.5 11.4V4.9a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3v6.5" />
    </g>
    <g stroke="var(--primary-color)">
      <circle cx="8" cy="12.5" r="1.5" />
      <path d="M8 11.4V1.9" />
    </g>
  </svg>
);
