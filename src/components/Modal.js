import React from 'react';

export default function Modal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p>Are you sure you want to delete this ticket?</p>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white rounded-full px-4 py-2 hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white rounded-full px-4 py-2 hover:bg-red-600 focus:outline-none focus:bg-red-600"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
