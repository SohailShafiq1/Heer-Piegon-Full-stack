import { IoIosPeople } from "react-icons/io"; 
import { BiEdit } from "react-icons/bi";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { IoAddCircleOutline } from "react-icons/io5";
import React, { useState } from "react";
import style from "./tournament.module.css";
import { FaMinusCircle } from "react-icons/fa";
const s = style;
import {NavLink} from 'react-router-dom'
const Tournament = () => {
  const [data,setData] = useState([
    { name: "Lahore" },
    { name: "Faisalabad" },
    { name: "Rawalpindi" },
    { name: "Multan" },
  ]);
  const removeItem = (index)=>
  {
  const updatedData = data.filter((_,i) =>i!==index)
  setData(updatedData )
  }
  const [tournament, addTournament] = useState(false);
  const adding = () => {
    addTournament(!tournament);
  };
  const [editTournament, setEditTournament] = useState(false);
  const editing = () => {
    setEditTournament(!editTournament);
  };
  const [addPerson, setAddPerson] = useState(false);
  const addingPerson = () => {
    setAddPerson(!addPerson);
  };
  return (
    <div className={s.container}>
      <div className={s.top}>
        <h1>Tournament</h1>

        <IoAddCircleOutline className={s.add} onClick={adding} />
      </div>
      {tournament && (
        <div className={s.popup}>
          <h1>New Tournament</h1>
          <input type="text" />
          <div className={s.dates}>
            <div>
              <h2>Start Date</h2>
              <input type="date" />
            </div>
            <div>
              <h2>End Date</h2>
              <input type="date" />
            </div>
          </div>
          <div className={s.button}>
            <button className={s.cancelbtn} onClick={adding}>
              {" "}
              Cancel
            </button>
            <button className={s.addbtn} onClick={adding}>
              {" "}
              Add
            </button>
          </div>
        </div>
      )}
      <div className={s.table}>
        <table className={s.tournamenttable}>
          <thead>
            <tr>
              <th>Count</th>
              <th>Name</th>
              <th>Add</th>
              <th>Edit</th>
              <th>Remove </th>
              <th>Details </th>
            </tr>
          </thead>
          <tbody>
            {data.map((tournament, index) => (
              <tr>
                <td>{index + 1}</td>
                <td>{tournament.name}</td>
                <td>
                  <AiOutlineUsergroupAdd
                    className={s.addperson}
                    onClick={addingPerson}
                  />
                  {addPerson && (
                    <div className={s.popup}>
                      <div className={s.personData}>
                        <h1>Add Person</h1>

                        <h3>Player Name</h3>
                        <input type="text" />

                        <h3>Player Address</h3>
                        <input type="text" />
                        <h3>Add Photo</h3>

                        <input type="file" className={s.fileInput} />
                        <button
                          className={s.uploadButton}
                          onClick={addingPerson}
                        >
                          Upload Photo
                        </button>
                      </div>

                      <div className={s.button}>
                        <button className={s.cancelbtn} onClick={addingPerson}>
                          {" "}
                          Cancel
                        </button>
                        <button className={s.addbtn} onClick={addingPerson}>
                          {" "}
                          Add
                        </button>
                        
                      </div>
                    </div>
                  )}
                </td>
                <td>
                  <BiEdit className={s.edit} onClick={editing} />
                </td>
                {editTournament && (
                  <div className={s.popup}>
                    <h1>Edit Tournament</h1>
                    <input type="text" />
                    <div className={s.dates}>
                      <div>
                        <h2>Start Date</h2>
                        <input type="date" />
                      </div>
                      <div>
                        <h2>End Date</h2>
                        <input type="date" />
                      </div>
                    </div>
                    <div className={s.button}>
                      <button className={s.cancelbtn} onClick={editing}>
                        {" "}
                        Cancel
                      </button>
                      <button className={s.addbtn} onClick={editing}>
                        {" "}
                        Add
                      </button>
                    </div>
                  </div>
                )}
                <td>
                  <FaMinusCircle className={s.remove} onClick={()=>{removeItem(index)}} />
                </td>
                <td>
                 <NavLink to={"/person"}>  <IoIosPeople className={s.addperson}  /></NavLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tournament;
