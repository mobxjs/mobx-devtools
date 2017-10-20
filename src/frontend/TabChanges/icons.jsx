import React from 'react';

export const IconScheduledReaction = props => (
  <svg
    baseProfile="basic"
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 15 15"
    {...props}
  >
    <g fill="none" stroke="#D57273" strokeMiterlimit="10">
      <path d="M12.697 10.5a6 6 0 1 1 .115-5.792" />
      <path d="M7.5 7.5V3M7.5 7.5L10 10" />
    </g>
    <g fill="#D57273">
      <path d="M10.618 4.743L13.5 7.5l.947-3.874z" />
      <circle cx="7.5" cy="7.5" r=".75" />
    </g>
  </svg>
);

export const IconComputed = props => (
  <svg
    baseProfile="basic"
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 15 15"
    {...props}
  >
    <g fill="#7B56A3">
      <circle cx="3.75" cy="11.83" r="2" />
      <circle cx="3.75" cy="3.17" r="2" />
      <circle cx="11.25" cy="7.5" r="2" />
    </g>
    <g fill="none" stroke="#7B56A3" strokeMiterlimit="10">
      <path d="M6.25 7.5l-2.5 4.33" />
      <path d="M6.25 7.5l-2.5-4.33" />
      <path d="M6.25 7.5h5" />
    </g>
  </svg>
);

export const IconError = props => (
  <svg
    baseProfile="basic"
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 15 15"
    {...props}
  >
    <path
      fill="none"
      stroke="#E41E26"
      strokeLinejoin="round"
      strokeMiterlimit="10"
      d="M1.414 13.5L7.501 2l6.085 11.5z"
    />
    <g fill="#E41E26">
      <path d="M6.848 6h1.304v2.589L7.99 10h-.97l-.172-1.411z" />
      <circle cx="7.5" cy="11.5" r=".875" />
    </g>
  </svg>
);
