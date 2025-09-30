import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Reusable accessible Modal with portal, scroll lock, ESC/backdrop close, focus trap
// Props:
// - isOpen: boolean
// - onClose: () => void
// - title: string | ReactNode (aria-labelledby)
// - size: 'sm' | 'md' | 'lg' (max-width)
// - height: string (e.g. '80vh')
// - closeOnBackdrop: boolean (default true)
// - closeOnEsc: boolean (default true)
// - footer: ReactNode (rendered below body)
// - topOffset: CSS length (offset from top for navbar), default 'var(--navbar-h, 6rem)'
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  height = '80vh',
  closeOnBackdrop = true,
  closeOnEsc = true,
  topOffset = 'var(--navbar-h, 6rem)'
}) {
  const dialogRef = useRef(null);
  const lastActiveRef = useRef(null);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Save/restore focus
  useEffect(() => {
    if (isOpen) {
      lastActiveRef.current = document.activeElement;
      // Focus first focusable element in dialog
      setTimeout(() => {
        const el = dialogRef.current;
        if (!el) return;
        const focusable = el.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        (focusable || el).focus();
      }, 0);
    } else if (lastActiveRef.current) {
      try { lastActiveRef.current.focus(); } catch {}
    }
  }, [isOpen]);

  // Focus trap
  const onKeyDown = useCallback((e) => {
    if (!dialogRef.current) return;
    if (closeOnEsc && e.key === 'Escape') {
      e.stopPropagation();
      onClose?.();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusable = dialogRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const list = Array.from(focusable).filter((el) => !el.hasAttribute('disabled'));
    if (list.length === 0) return;
    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement;
    if (e.shiftKey) {
      if (active === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [closeOnEsc, onClose]);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  const dialogStyles = {
    top: topOffset,
    height,
    maxHeight: height,
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop from navbar bottom to viewport bottom */}
          <motion.div
            className="fixed left-0 right-0 z-50"
            style={{ top: topOffset, bottom: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => closeOnBackdrop && onClose?.()}
          />

          {/* Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : undefined}
            className={`fixed left-1/2 -translate-x-1/2 z-[60] w-full ${sizes[size]} bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl flex flex-col overflow-hidden`}
            style={dialogStyles}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onKeyDown={onKeyDown}
            ref={dialogRef}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">{title}</div>
              <button aria-label="Close" onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {children}
            </div>
            {/* Footer */}
            {footer && (
              <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
