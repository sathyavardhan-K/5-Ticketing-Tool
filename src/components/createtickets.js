import React, { useEffect, useState } from 'react';
import domo from 'ryuu.js'; // Adjust the import based on your setup

export default function Createtickets() {
  const [team, setTeam] = useState('');
  const [ticketName, setTicketName] = useState('');
  const [ticketDetails, setTicketDetails] = useState('');
  const [teamList, setTeamList] = useState([]); // State to hold the team list
  const [existingTickets, setExistingTickets] = useState([]); // State to hold existing tickets
  const [errorMessage, setErrorMessage] = useState(''); // State for error messages

  useEffect(() => {
    // Fetch the team list data
    domo.get('/domo/datastores/v1/collections/create_team/documents')
      .then(data => {
        console.log('Fetched Teams data:', data);
        setTeamList(data);
      })
      .catch(error => console.error('Error fetching teams data:', error));

    // Fetch the existing tickets data
    domo.get('/domo/datastores/v1/collections/create_ticket/documents')
      .then(data => {
        console.log('Fetched Tickets data:', data);
        setExistingTickets(data.map(ticket => ticket.content['Ticket Name']));
      })
      .catch(error => console.error('Error fetching tickets data:', error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if ticket name is unique
    if (existingTickets.includes(ticketName)) {
      setErrorMessage('Ticket name already exists. Please choose a different name.');
      return;
    }

    setErrorMessage('');

    // Format data for API request
    const finalData = {
      content: {
        'Team': team,
        'Ticket Name': ticketName,
        'Ticket Details': ticketDetails,
      }
    };

    // Log finalData to check the structure
    console.log('Data to be sent:', finalData);

    try {
      const response = await domo.post(`/domo/datastores/v1/collections/create_ticket/documents/`, finalData);
      console.log('create_ticket_db_response', response);
      alert('Ticket Created Successfully!');
      // Clear form fields after successful submission
      setTeam('');
      setTicketName('');
      setTicketDetails('');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-20 bg-white shadow-lg rounded-lg p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Create Ticket</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="team">
            Team
          </label>
          <select
            id="team"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-600"
            required
          >
            <option value="">Select Team</option>
            {teamList.map((teamItem) => (
              <option key={teamItem.id} value={teamItem.content['Team Name']}>
                {teamItem.content['Team Name']} - {teamItem.content['Team Members'].map(member => member['Member Name']).join(', ')}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="ticketName">
            Ticket Name
          </label>
          <input
            id="ticketName"
            type="text"
            value={ticketName}
            onChange={(e) => setTicketName(e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-600"
            placeholder="Enter ticket name"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="ticketDetails">
            Ticket Details
          </label>
          <textarea
            id="ticketDetails"
            value={ticketDetails}
            onChange={(e) => setTicketDetails(e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-600"
            placeholder="Enter ticket details"
            required
          />
        </div>
        {errorMessage && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-500 text-white rounded-full px-4 py-2 hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
          >
            Create Ticket
          </button>
        </div>
      </form>
    </div>
  );
}
