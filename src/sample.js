// import logo from './logo.svg';
import { useEffect, useState } from 'react';
import './App.css';
import domo from 'ryuu.js'
// import Team from './Components/Team';

const App = () => {
let [teamName, setTeamName] = useState();
let [personName, setPersonName] = useState();

useEffect(()=>{

    domo.get(`/domo/users/v1?includeDetails=true&limit=137`)
    .then((data)=>{
      const detail = [];
      data.forEach(element => 
      detail.push(element.displayName));
      setPersonName(detail)
        // setLoading(false)
      console.log("personEmail",personName);
      }); 
    }, [])

  return(
    <div id='main'>
        <div id='container'>
          <nav>
              <p>Hello <b>Bharath!</b></p>
          </nav>
            <div id='content'>
              <button id='createTeam'>Create Team</button>
                <table>
                  <tr>
                    <td>
                      <label>Team name:</label>
                    </td>
                    <td>
                      <input onChange={updateTeamName} value={teamName} placeholder='Enter the team name'/>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>People/Member:</label>
                    </td>
                    <td>
                      <select >
                      {
                      personName.map((name, index)=>(<option key={index}>{name}</option>
                      ))}
                      </select>
                    </td>
                  </tr>
                </table>
              <button id='create'>Create</button>
            </div>
        </div>
    </div>
  )
}

export default App;