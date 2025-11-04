import React, { useEffect, useState } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "warning" | "danger";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getConfirmButtonColor = () => {
    switch (type) {
      case "danger":
        return "bg-red-500 hover:bg-red-600";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600";
      default:
        return "bg-blue-500 hover:bg-blue-600";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 max-w-[500px] w-[90%] max-h-[80vh] overflow-auto shadow-xl animate-[scaleIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="m-0 mb-4 text-xl font-semibold text-gray-900">
          {title}
        </h2>
        <div className="mb-6 text-gray-600 text-sm">{children}</div>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 cursor-pointer text-sm font-medium transition-all hover:bg-gray-50"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 rounded-md border-none text-white cursor-pointer text-sm font-medium transition-all ${getConfirmButtonColor()}`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: (value: string) => void;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
}

export const InputModal: React.FC<InputModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  placeholder = "",
  defaultValue = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value.trim());
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onConfirm={handleConfirm}
      confirmText={confirmText}
      cancelText={cancelText}
    >
      <p className="mb-4">{message}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleConfirm();
          } else if (e.key === "Escape") {
            onClose();
          }
        }}
        autoFocus
        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm outline-none transition-colors focus:border-blue-500"
      />
    </Modal>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "warning" | "danger";
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onConfirm={onConfirm}
      confirmText={confirmText}
      cancelText={cancelText}
      type={type}
    >
      <p>{message}</p>
    </Modal>
  );
};
