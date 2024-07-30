import React, { useEffect, useState } from 'react';
import './App.css';
import domo from 'ryuu.js';
import { BrowserRouter, Routes, Route, Link} from 'react-router-dom';

import Createtickets from "./components/createtickets";
import Manageteam from "./components/manageteam";
import CreateTeam from "./components/createteam";
import Managetickets from "./components/managetickets";


function App() {

  const [currentUserDisplayName, setCurrentUserDisplayName] = useState('');
  const [avatarSrc, setAvatarSrc] = useState('');

  useEffect(() => {

    const currentUser = domo.env.userId;
    console.log('Current User ID:', currentUser);

    if (currentUser) {
      domo.get(`/domo/users/v1/${currentUser}?includeDetails=true`)
        .then(user => {
          console.log('Current user:', user);

          if (user) {
            setCurrentUserDisplayName(user.displayName);
            setAvatarSrc(user.avatarKey);
          } else {
            console.error('User data is empty:', user);
          }

        })
        .catch(error => console.error('Error fetching current user:', error));
    }
  }, []);

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
    </div>
  );
}

export default App;
