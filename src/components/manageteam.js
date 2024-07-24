import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import domo from 'ryuu.js'; // Adjust the import based on your setup
import Select from 'react-select'; // Import react-select

export default function ManageTeam() {
  const [teamList, setTeamList] = useState([]);
  const [userList, setUserList] = useState([]); // State for storing the list of users
  const [editTeam, setEditTeam] = useState(null);
  const [newTeamDetails, setNewTeamDetails] = useState({});
  const [usersData, setUsersData] = useState([]);
  const location = useLocation();
  const { teamData } = location.state || {};
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all created teams data
    domo.get(`/domo/datastores/v1/collections/create_team/documents`)
      .then(data => {
        console.log('Fetched Teams data:', data);
        setTeamList(data);
      })
      .catch(error => console.error('Error fetching teams data:', error));

    // Fetch all users data
    domo.get(`/domo/datastores/v1/collections/users/documents`)
      .then(data => {
        console.log('Fetched Users data:', data);
        const options = data.map(user => ({
          value: user.detail.email,
          label: user.displayName,
          id: user.id,
          name: user.displayName,
          avatar: user.detail.avatarKey
        }));
        setUsersData(options);
        setUserList(data); // Store user list for selection
      })
      .catch(error => console.error('Error fetching users data:', error));
  }, []);

  const handleCreateTeamClick = () => {
    navigate('/manageteam/createteam');
  };

  const handleEditClick = (team) => {
    setEditTeam(team);
    setNewTeamDetails({
      teamName: team.content['Team Name'],
      members: team.content['Team Members'].map(member => ({
        ...member,
        userOption: usersData.find(user => user.value === member['Member Email'])
      })),
    });
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...newTeamDetails.members];
    updatedMembers[index][field] = value;
    setNewTeamDetails(prevDetails => ({ ...prevDetails, members: updatedMembers }));
  };

  const handleUserSelect = (index, selectedOption) => {
    const selectedUser = userList.find(user => user.id === selectedOption.id);
    if (selectedUser) {
      handleMemberChange(index, 'Member Name', selectedUser.displayName);
      handleMemberChange(index, 'Member Email', selectedUser.detail.email);
    } else {
      console.error('User not found:', selectedOption.id);
    }
  };

  const handleSaveEditClick = async () => {
    const updatedTeam = {
      ...editTeam,
      content: {
        'Team Name': newTeamDetails.teamName,
        'Team Members': newTeamDetails.members.map(member => ({
          'Member Name': member['Member Name'],
          'Member Email': member['Member Email']
        }))
      }
    };

    try {
      await domo.put(`/domo/datastores/v1/collections/create_team/documents/${editTeam.id}`, updatedTeam);
      setTeamList(prevTeamList => prevTeamList.map(team => (team.id === editTeam.id ? updatedTeam : team)));
      setEditTeam(null);
      setNewTeamDetails({});
      alert('Team updated successfully!');
    } catch (error) {
      console.error('Error updating team:', error);
      alert('Failed to update team. Please try again.');
    }
  };

  const handleDeleteClick = async (teamId) => {
    try {
      await domo.delete(`/domo/datastores/v1/collections/create_team/documents/${teamId}`);
      setTeamList(prevTeamList => prevTeamList.filter(team => team.id !== teamId));
      alert('Team deleted successfully!');
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team. Please try again.');
    }
  };

  return (
    <div className="relative p-4">
      {/* Button */}
      <button
        onClick={handleCreateTeamClick}
        className="absolute top-4 right-4 bg-indigo-500 text-white rounded-full px-4 py-2 hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
      >
        Create Team
      </button>

      <h1 className="text-xl font-bold text-gray-800 mb-4 w-full max-w-md mx-auto">Manage Team</h1>

      {/* Display Details of Selected Team */}
      {teamData && (
        <div className="w-full max-w-xl mx-auto mt-6 bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-700">Team Name: {teamData.teamName}</h2>
          {teamData.selectedUsers && teamData.selectedUsers.length > 0 ? (
            <div className="mt-4">
              {teamData.selectedUsers.map(user => (
                <div key={user.email} className="p-2 border rounded mb-2">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>ID:</strong> {user.id}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No users selected</p>
          )}
        </div>
      )}

      {/* Edit Team Form */}
      {editTeam && (
        <div className="w-full max-w-xl mx-auto mt-6 bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Edit Team</h2>
          <input
            type="text"
            value={newTeamDetails.teamName || ''}
            onChange={(e) => setNewTeamDetails(prevDetails => ({ ...prevDetails, teamName: e.target.value }))}
            className="w-full px-4 py-2 border rounded mb-4"
            placeholder="Team Name"
          />
          {newTeamDetails.members && newTeamDetails.members.map((member, index) => (
            <div key={index} className="mb-4">
              <Select
                value={member.userOption}
                onChange={(selectedOption) => handleUserSelect(index, selectedOption)}
                options={usersData}
                className="mb-2"
                classNamePrefix="react-select"
                placeholder="Select User"
              />
              <input
                type="text"
                value={member['Member Name'] || ''}
                onChange={(e) => handleMemberChange(index, 'Member Name', e.target.value)}
                className="w-full px-4 py-2 border rounded mb-2"
                placeholder="Member Name"
              />
              <input
                type="email"
                value={member['Member Email'] || ''}
                onChange={(e) => handleMemberChange(index, 'Member Email', e.target.value)}
                className="w-full px-4 py-2 border rounded"
                placeholder="Member Email"
              />
            </div>
          ))}
          <div className="flex space-x-2">
            <button
              onClick={handleSaveEditClick}
              className="bg-green-500 text-white rounded-full px-4 py-2 hover:bg-green-600 focus:outline-none focus:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => setEditTeam(null)}
              className="bg-gray-500 text-white rounded-full px-4 py-2 hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Display All Teams in Table Format */}
      <div className="w-full max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">All Teams</h2>
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Members Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Members Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamList.length > 0 ? (
                teamList.map((team, index) =>
                  team.content['Team Members'].map((member, memberIndex) => (
                    <tr key={`${team.id}-${memberIndex}`}>
                      {memberIndex === 0 && (
                        <>
                          <td rowSpan={team.content['Team Members'].length} className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                          <td rowSpan={team.content['Team Members'].length} className="px-6 py-4 text-sm text-gray-500">{team.content['Team Name']}</td>
                        </>
                      )}
                      <td className="px-6 py-4 text-sm text-gray-500">{member['Member Name']}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{member['Member Email']}</td>
                      {memberIndex === 0 && (
                        <td rowSpan={team.content['Team Members'].length} className="px-6 py-4 text-sm text-gray-500">
                          <button
                            onClick={() => handleEditClick(team)}
                            className="bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600 focus:outline-none focus:bg-blue-600 mb-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(team.id)}
                            className="bg-red-500 text-white rounded-full px-4 py-2 hover:bg-red-600 focus:outline-none focus:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-600">No teams available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
