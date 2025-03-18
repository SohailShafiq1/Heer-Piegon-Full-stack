import { BiEdit } from "react-icons/bi";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { IoAddCircleOutline } from "react-icons/io5";
import React, { useState } from "react";
import style from "./tournament.module.css";
import { FaMinusCircle } from "react-icons/fa";
const s = style;
const Tournament = () => {
  const data = [
    { name: "Lahore" },
    { name: "Faisalabad" },
    { name: "Rawalpindi" },
    { name: "Multan" },
    
  ];
const [tournament,addTournament] = useState(false)
const adding = ()=>
{
    addTournament(!tournament)
}
  return (
    <div className={s.container}>
      <div className={s.top}>
        <h1>Tournament</h1>

        <IoAddCircleOutline className={s.add} onClick={adding} />
      </div>
      {tournament && (<div className={s.popup}>
            <input />
        </div>)}
      <div className={s.table}>
        <table className={s.tournamenttable}>
          <thead>
            <tr>
              <th>Count</th>
              <th>Name</th>
              <th>Add</th>
              <th>Edit</th>
              <th>Remove </th>
            </tr>
          </thead>
          <tbody>
            {data.map((tournament, index) => (
              <tr>
                <td>{index + 1}</td>
                <td>{tournament.name}</td>
                <td>
                  <AiOutlineUsergroupAdd className={s.addperson} />
                </td>
                <td>
                  <BiEdit className={s.edit} />
                </td>
                <td>
                  <FaMinusCircle className={s.remove} />
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
