import React, { useEffect, useState } from 'react';
import domo from 'ryuu.js'; // Adjust the import based on your setup

export default function ManageTeam() {
  const [ticketList, setTicketList] = useState([]);

  useEffect(() => {
    // Fetch all tickets data
    domo.get(`/domo/datastores/v1/collections/create_ticket/documents`)
      .then(data => {
        console.log('Fetched Tickets data:', data);
        setTicketList(data);
      })
      .catch(error => console.error('Error fetching tickets data:', error));
  }, []);

  const handleEditClick = (ticketId) => {
    // Implement edit logic here
    console.log('Edit ticket with ID:', ticketId);
  };

  const handleDeleteClick = (ticketId) => {
    // Implement delete logic here
    console.log('Delete ticket with ID:', ticketId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-20 bg-white shadow-lg rounded-lg p-6">
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
                      onClick={() => handleEditClick(ticket.id)}
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
    </div>
  );
}
