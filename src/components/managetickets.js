import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import domo from 'ryuu.js'; // Adjust the import based on your setup
import { ToastContainer, toast } from 'react-toastify';
import Modal from './Modal'; // Import the Modal component
import 'react-toastify/dist/ReactToastify.css';

export default function ManageTickets() {
  const [ticketList, setTicketList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all tickets data
    domo.get(`/domo/datastores/v1/collections/create_ticket/documents`)
      .then(data => {
        console.log('Fetched Tickets data:', data);
        setTicketList(data);
      })
      .catch(error => console.error('Error fetching tickets data:', error));
  }, []);

  const handleEditClick = (ticket) => {
    navigate('/', { state: { ticketData: ticket } });
  };

  const handleDeleteClick = (ticketId) => {
    setTicketToDelete(ticketId);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await domo.delete(`/domo/datastores/v1/collections/create_ticket/documents/${ticketToDelete}`);
      setTicketList(prevTicketList => prevTicketList.filter(ticket => ticket.id !== ticketToDelete));
      toast.success('Ticket deleted successfully!');
      setIsModalOpen(false);
      setTicketToDelete(null);
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('Failed to delete ticket. Please try again.');
      setIsModalOpen(false);
      setTicketToDelete(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-20 bg-white shadow-lg rounded-lg p-6">
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <h1 className="text-xl font-bold text-gray-800 mb-4">Manage Tickets</h1>

      <div className="max-h-80 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ticketList.length > 0 ? (
              ticketList.map((ticket, index) => (
                <tr key={ticket.id}>
                  <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{ticket.content['Team']}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{ticket.content['Ticket Name']}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{ticket.content['Ticket Details']}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 flex space-x-2">
                    <button
                      onClick={() => handleEditClick(ticket)}
                      className="bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(ticket.id)}
                      className="bg-red-500 text-white rounded-full px-4 py-2 hover:bg-red-600 focus:outline-none focus:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-600">No tickets available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
