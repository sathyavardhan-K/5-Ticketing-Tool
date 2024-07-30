import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import domo from 'ryuu.js'; // Adjust the import based on your setup
import { ToastContainer, toast } from 'react-toastify';
import Modal from './Modal'; // Import the Modal component
import 'react-toastify/dist/ReactToastify.css';

export default function ManageTeam() {
  const [teamList, setTeamList] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all created teams data
    domo.get('/domo/datastores/v1/collections/create_team/documents')
      .then(data => {
        console.log('Fetched Teams data:', data);
        setTeamList(data);
      })
      .catch(error => console.error('Error fetching teams data:', error));

    // Fetch all users data
    domo.get('/domo/users/v1?includeDetails=true&limit=150')
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
      })
      .catch(error => console.error('Error fetching users data:', error));
  }, []);

  const handleCreateTeamClick = () => {
    navigate('/manageteam/createteam');
  };

  const handleEditClick = (team) => {
    navigate('/manageteam/createteam', { state: { teamData: team } });
  };

  const handleDeleteClick = (teamId) => {
    setTeamToDelete(teamId);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await domo.delete(`/domo/datastores/v1/collections/create_team/documents/${teamToDelete}`);
      setTeamList(prevTeamList => prevTeamList.filter(team => team.id !== teamToDelete));
      toast.success('Team deleted successfully!');
      setIsModalOpen(false);
      setTeamToDelete(null);
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team. Please try again.');
      setIsModalOpen(false);
      setTeamToDelete(null);
    }
  };

  return (
    <div className="relative p-6">
      <ToastContainer
          position="bottom-center"  // Position notifications at the bottom center
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="mt-20"  // Additional margin to push the container down
      />

      {/* Button */}
      <button
        onClick={handleCreateTeamClick}
        className="absolute top-4 right-4 bg-indigo-500 text-white rounded-full px-4 py-2 hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
      >
        Create Team
      </button>

      <h1 className="text-xl font-bold text-gray-800 mb-4 w-full max-w-md mx-auto">Manage Team</h1>

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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
