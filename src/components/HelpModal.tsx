import React from "react";
import {
  KeyboardShortcut,
  formatShortcut,
} from "../hooks/useKeyboardShortcuts";
import { Modal } from "./Modal";

export interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  shortcuts,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Help & Keyboard Shortcuts">
      <div className="max-h-[60vh] overflow-y-auto">
        <section className="mb-6">
          <h3 className="text-base font-semibold mb-3 text-gray-900">
            Getting Started
          </h3>
          <ul className="m-0 pl-5 text-gray-600 text-sm leading-relaxed">
            <li>Load a PDF by entering its path in the "PDF Source" field</li>
            <li>
              Navigate pages using the arrow buttons or keyboard shortcuts
            </li>
            <li>Select text in the PDF to create highlights</li>
            <li>Fill in the extraction fields for each page</li>
            <li>Export your data as JSON or CSV when complete</li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-base font-semibold mb-3 text-gray-900">
            Features
          </h3>
          <ul className="m-0 pl-5 text-gray-600 text-sm leading-relaxed">
            <li>
              <strong>Multi-Project Support:</strong> Create and manage multiple
              review projects
            </li>
            <li>
              <strong>Text Highlighting:</strong> Select and label important
              passages
            </li>
            <li>
              <strong>Search:</strong> Find text across the entire PDF
            </li>
            <li>
              <strong>Per-Page Templates:</strong> Different extraction fields
              for each page
            </li>
            <li>
              <strong>Custom Fields:</strong> Add your own extraction fields
            </li>
            <li>
              <strong>Data Export:</strong> Export to JSON or CSV formats
            </li>
            <li>
              <strong>Auto-Save:</strong> All data automatically saved to
              browser storage
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-base font-semibold mb-3 text-gray-900">
            Keyboard Shortcuts
          </h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left p-2 text-gray-500 font-semibold">
                  Shortcut
                </th>
                <th className="text-left p-2 text-gray-500 font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {shortcuts.map((shortcut, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="p-2">
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs text-gray-700">
                      {formatShortcut(shortcut)}
                    </code>
                  </td>
                  <td className="p-2 text-gray-600">{shortcut.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-6 p-3 bg-yellow-100 rounded-md">
          <p className="m-0 text-xs text-yellow-800">
            <strong>💡 Tip:</strong> All your data is saved automatically in
            your browser's local storage. Make sure to export your data
            regularly to avoid data loss.
          </p>
        </section>
      </div>
    </Modal>
  );
};
