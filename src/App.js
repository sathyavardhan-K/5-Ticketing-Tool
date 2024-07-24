import React, { useEffect, useState } from 'react';
import './App.css';
import domo from 'ryuu.js';
import { BrowserRouter, Routes, Route, Link} from 'react-router-dom';


import Createtickets from "./components/createtickets";
import Manageteam from "./components/manageteam";
import CreateTeam from "./components/createteam"; 
import Managetickets from "./components/managetickets";




function App() {
  // const [usersData, setUsersData] = useState([]);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState('');
  // const [currentUserId, setCurrentUserId] = useState('');
  const [avatarSrc, setAvatarSrc] = useState('');
  // const [selectedOptions, setSelectedOptions] = useState([]);
  // const [selectedIds, setSelectedIds] = useState([]);

  // const emailToIdMap = {}; 

  useEffect(() => {
    // Fetch all users data
    // domo.get('/domo/users/v1?includeDetails=true&limit=150')
    //   .then(data => {
    //     console.log('Users data:', data);
    //     setUsersData(data);
        
    //     data.forEach(user => {
    //       emailToIdMap[user.detail.email] = user.id;
    //     });
    //   })
    //   .catch(error => console.error('Error fetching users data:', error));

    // Fetch current user's details
    const currentUser = domo.env.userId;
    console.log('Current User ID:', currentUser);

    // console.log('Domo object:', domo);
    // const currentUser = domo.env?.userId;
    // console.log('Current User ID:', currentUser);

    if (currentUser) {
      domo.get(`/domo/users/v1/${currentUser}?includeDetails=true`)
        .then(user => {
          console.log('Current user:', user);
          if (user) {
            setCurrentUserDisplayName(user.displayName);
            // setCurrentUserId(user.id);
            setAvatarSrc(user.avatarKey);
          } else {
            console.error('User data is empty:', user);
          }
        })
        .catch(error => console.error('Error fetching current user:', error));
    }
  }, []);

  // Handle select change
  // const handleSelectChange = (selectedOptions) => {
  //   setSelectedOptions(selectedOptions);
  //   const ids = selectedOptions.map(option => emailToIdMap[option.value]);
  //   setSelectedIds(ids);
  //   console.log(ids);
  // };

  // Prepare options for react-select
  // const options = usersData.map(user => ({ 
  //   value: user.detail.email,
  //   label: user.displayName,
  //   id: user.id
  // }));

  return (
 
    <div className="App">
      <header className="bg-gray-800 text-white py-4">
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1 className="text-2xl font-bold">Ticketing Tool</h1>
          <div className="flex items-center">
            <h1 id="myname" className="mr-4 text-right font-bold text-xl">{`Welcome ${currentUserDisplayName}!`}</h1>
            <img src={avatarSrc} alt="avatar" id="avatar" className="mr-3 rounded-full" width="35px" height="35px" />
          </div>
        </div>
      </header>
      <BrowserRouter>
          <div className="flex">
            <nav className="w-64 h-screen bg-gray-800 text-white">
              <ul className="flex flex-col p-4 space-y-4">
                <li>
                  <Link to="/" className="block p-2 bg-indigo-500 rounded hover:bg-indigo-600">
                    Create Ticket
                  </Link>
                </li>
                <li>
                  <Link to="/manageteam" className="block p-2 bg-indigo-500 rounded hover:bg-indigo-600">
                    Manage Team
                  </Link>
                </li>
                <li>
                  <Link to="/managetickets" className="block p-2 bg-indigo-500 rounded hover:bg-indigo-600">
                    Manage Tickets
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="flex-1 p-4">
              <Routes>
                <Route path="/" element={<Createtickets />} />
                <Route path="/manageteam" element={<Manageteam />} />
                <Route path="/manageteam/createteam" element={<CreateTeam />} />
                <Route path="/managetickets" element={<Managetickets />} />
              </Routes>
            </div>
          </div>
      </BrowserRouter>
       
      {/* <div className="w-full max-w-md mx-auto mt-20 bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-800">Team Name</h1>
            <input 
              type="text" 
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-600" 
              placeholder="Enter team name" 
            />
          </div>
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-800">People/Members</h1>
            <Select
              className="mt-2"
              classNamePrefix="react-select"
              options={options}
              isMulti
              placeholder="Select Users"
              value={selectedOptions}
              onChange={handleSelectChange}
            />
          </div>
          <div className="flex justify-end">
            <button className="bg-indigo-500 text-white rounded-full px-4 py-2 hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600">Create Team</button>
          </div>
        </div>
      </div>*/}
      </div>



  );
}

export default App;
