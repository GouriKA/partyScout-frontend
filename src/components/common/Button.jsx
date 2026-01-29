import './Button.css';

export default function Button({
  children,
  variant = 'primary', // primary | secondary | outline | ghost
  size = 'medium', // small | medium | large
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const classNames = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full-width',
    loading && 'btn-loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      <span className={loading ? 'btn-content-loading' : ''}>{children}</span>
    </button>
  );
}
