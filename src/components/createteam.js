import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import domo from 'ryuu.js'; // Adjust the import based on your setup

export default function CreateTeam() {
  const [teamName, setTeamName] = useState('');
  const [usersData, setUsersData] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]); // State for selected users with email, name, and id
  const [existingTeams, setExistingTeams] = useState([]); // State for existing teams

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all users data
    domo.get('/domo/users/v1?includeDetails=true&limit=150')
      .then(data => {
        console.log('Users data:', data);

        const options = data.map(user => ({
          value: user.detail.email,
          label: user.displayName,
          id: user.id,
          name: user.displayName,
          avatar: user.detail.avatarKey
        }));

        setUsersData(options);
        console.log("options:", options);
      })
      .catch(error => console.error('Error fetching users data:', error));

    // Fetch all existing teams data
    domo.get(`/domo/datastores/v1/collections/create_team/documents`)
      .then(data => {
        console.log('Fetched Teams data:', data);
        setExistingTeams(data.map(team => team.content['Team Name']));
      })
      .catch(error => console.error('Error fetching teams data:', error));
  }, []);

  const handleSelectChange = (selectedOptions) => {
    setSelectedOptions(selectedOptions);
    const users = selectedOptions.map(option => ({
      email: option.value,
      name: option.name,
      id: option.id,
    }));
    setSelectedUsers(users);
    console.log('Selected Users:', users);
  };

  const isTeamNameUnique = (name) => {
    return !existingTeams.includes(name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isTeamNameUnique(teamName)) {
      alert('Team name already exists. Please choose a different name.');
      return;
    }

    const teamData = {
      teamName,
      selectedUsers
    };

    const finalData = {
      content: {
        'Team Name': teamData.teamName,
        'Team Members': teamData.selectedUsers.map(user => ({
          'Member Name': user.name,
          'Member Email': user.email
        }))
      }
    };

    console.log('Data to be sent:', finalData);

    domo.post(`/domo/datastores/v1/collections/create_team/documents/`, finalData)
      .then(response => {
        console.log('create_team_db_response', response);
         // Reset form fields
         setTeamName('');
         setSelectedOptions([]);
         setSelectedUsers([]);
        alert('Team Created Successfully!');

       

        navigate('/manageteam', { state: { teamData } });
      })
      .catch(error => console.error('Error creating team:', error));
  };

  return (
    <div className="w-full max-w-md mx-auto mt-20 bg-white shadow-lg rounded-lg p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Create Team</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="teamName">
            Team Name
          </label>
          <input
            id="teamName"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-600"
            placeholder="Enter team name"
            required
          />
        </div>

        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-800">People/Members</h1>
          <Select
            className="mt-2"
            classNamePrefix="react-select"
            options={usersData}
            isMulti
            placeholder="Select Users"
            value={selectedOptions}
            onChange={handleSelectChange}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-500 text-white rounded-full px-4 py-2 hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
          >
            Create Team
          </button>
        </div>
      </form>
    </div>
  );
}
