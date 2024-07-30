import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import domo from 'ryuu.js'; // Adjust the import based on your setup
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import 'react-toastify/dist/ReactToastify.css';

export default function CreateTickets() {
  const [team, setTeam] = useState('');
  const [ticketName, setTicketName] = useState('');
  const [ticketDetails, setTicketDetails] = useState('');
  const [teamList, setTeamList] = useState([]);
  const [existingTickets, setExistingTickets] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [requestorName, setRequestorName] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { ticketData } = location.state || {};

  useEffect(() => {
    domo.get('/domo/datastores/v1/collections/create_team/documents')
      .then(data => {
        console.log('Fetched Teams data:', data);
        if (Array.isArray(data)) {
          const formattedTeams = data.map(teamItem => ({
            value: teamItem.content['Team Name'],
            label: `${teamItem.content['Team Name']} - ${teamItem.content['Team Members'].map(member => member['Member Name']).join(', ')}`
          }));
          setTeamList(formattedTeams);
        } else {
          console.error('Unexpected data structure for teams:', data);
        }
      })
      .catch(error => console.error('Error fetching teams data:', error));

    domo.get('/domo/datastores/v1/collections/create_ticket/documents')
      .then(data => {
        console.log('Fetched Tickets data:', data);
        if (Array.isArray(data)) {
          setExistingTickets(data.map(ticket => ticket.content['Ticket Name']));
        } else {
          console.error('Unexpected data structure for tickets:', data);
        }
      })
      .catch(error => console.error('Error fetching tickets data:', error));
  }, []);

  useEffect(() => {
    if (ticketData) {
      setTeam(ticketData.content['Team']);
      setTicketName(ticketData.content['Ticket Name']);
      setTicketDetails(ticketData.content['Ticket Details']);
    }
  }, [ticketData]);

  const fetchTeamMembersEmails = (teamName) => {
    domo.get('/domo/datastores/v1/collections/create_team/documents')
      .then(data => {
        console.log('Fetched Team Data:', data);
        if (!Array.isArray(data)) {
          console.error('Expected an array but received:', data);
          return;
        }

        console.log('Searching for team:', teamName);
        const team = data.find(item => 
          item.content && item.content['Team Name'] === teamName
        );

        console.log('Found Team:', team);

        if (team) {
          const teamMembers = team.content['Team Members'];
          console.log('Team Members:', teamMembers);
          
          const emails = teamMembers && Array.isArray(teamMembers)
            ? teamMembers.map(member => member['Member Email']).filter(email => email)
            : [];
          
          console.log('Extracted Emails:', emails);
          
          setSelectedMembers(emails);
        } else {
          console.warn('Team not found:', teamName);
          setSelectedMembers([]);
        }
      })
      .catch(error => {
        console.error('Error fetching team members data:', error);
        setSelectedMembers([]);
      });
  };

  useEffect(() => {
    domo.get('/domo/users/v1?includeDetails=true&limit=1')
      .then(() => {
        const currentUser = (domo.env).userId;
        console.log('Current User ID:', currentUser);
        
        return domo.get(`/domo/users/v1/${currentUser}?includeDetails=true`);
      })
      .then(data => {
        console.log('Current User Data:', data);
        setRequestorName(data.displayName);
      })
      .catch(error => console.error('Error fetching current user data:', error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (existingTickets.includes(ticketName) && !ticketData) {
      setErrorMessage('Ticket name already exists. Please choose a different name.');
      return;
    }

    setErrorMessage('');

    const finalData = {
      content: {
        'Team': team,
        'Ticket Name': ticketName,
        'Ticket Details': ticketDetails,
      }
    };

    try {
      const apiCall = ticketData
        ? domo.put(`/domo/datastores/v1/collections/create_ticket/documents/${ticketData.id}`, finalData)
        : domo.post(`/domo/datastores/v1/collections/create_ticket/documents/`, finalData);

      const response = await apiCall;
      console.log('Create Ticket DB Response:', response);

      if (!ticketData) {
        const subject = "New Ticket Created";
        const body = `
          <p><span style="font-weight: bold; margin-bottom: 2px;">Requestor Name: </span> ${requestorName} </p>
          <p><span style="font-weight: bold; margin-bottom: 2px;">Ticket Name: </span> ${ticketName} </p>
          <p><span style="font-weight: bold; margin-bottom: 2px;">Ticket Details: </span> ${ticketDetails} </p>
          <button type="button" style="font-weight: bold; margin-bottom: 2px;">View Ticket</button>
        `;

        console.log('Selected Members for Email:', selectedMembers);

        selectedMembers.forEach(email => {
          SendEmail(email, subject, body);
        });
      }

      toast.success(ticketData ? 'Ticket Updated Successfully!' : 'Ticket Created Successfully!');
      setTeam('');
      setTicketName('');
      setTicketDetails('');
      setSelectedMembers([]);

    } catch (error) {
      console.error('Error creating/updating ticket:', error);
      toast.error('Failed to create/update ticket. Please try again.');
    }
  };

  const SendEmail = async (to, subject = "New Ticket Created", body) => {
    console.log("Sending Email to:", to);

    if (!to) {
      console.error("No email address provided.");
      return;
    }

    try {
      const response = await domo.post(`/domo/workflow/v1/models/send_email/start`, {
        to: to,
        sub: subject,
        body: body
      });
      console.log('Workflow started successfully:', response);
    } catch (error) {
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-20 bg-white shadow-lg rounded-lg p-6">
      <ToastContainer />
      <h1 className="text-xl font-bold text-gray-800 mb-4">{ticketData ? 'Edit Ticket' : 'Create Ticket'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="team">
            Team
          </label>
          <Select
            id="team"
            value={teamList.find(option => option.value === team) || null}
            onChange={(selectedOption) => {
              setTeam(selectedOption ? selectedOption.value : '');
              fetchTeamMembersEmails(selectedOption ? selectedOption.value : '');
            }}
            options={teamList}
            placeholder="Select Team"
            className="w-full mt-2"
            required
          />
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
            {ticketData ? 'Update Ticket' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
