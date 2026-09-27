import React from 'react';
import './TactileButton.css';

/**
 * TactileButton - 3D mechanical push-down button inspired by Uiverse.io by Yaseen549.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - Button content / label
 * @param {string} [props.label="Power Smash"] - Fallback text if no children provided
 * @param {'purple'|'quiz'|'red'} [props.variant="purple"] - Button color theme variant
 * @param {React.ReactNode} [props.icon] - Optional custom icon
 * @param {boolean} [props.showLightning=true] - Whether to show default pulsing lightning bolt icon
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {function} [props.onClick] - Click handler
 * @param {string} [props.className=""] - Additional class names
 */
const TactileButton = ({
  children,
  label = 'Power Smash',
  variant = 'purple',
  icon,
  showLightning = true,
  disabled = false,
  onClick,
  className = '',
  ...rest
}) => {
  const variantClass = `tactile-button--${variant}`;

  return (
    <button
      type="button"
      className={`tactile-button ${variantClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      <span className="tactile-button__content">
        {icon ? (
          icon
        ) : showLightning ? (
          <svg
            className="tactile-button__icon-pulse"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        ) : null}
        <span>{children || label}</span>
      </span>
    </button>
  );
};

export default TactileButton;
