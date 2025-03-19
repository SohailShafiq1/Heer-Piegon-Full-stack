import React from 'react'
import style from './person.module.css'
const s = style
const Persons = () => {
    const data = [
        {
            name:"Sohail",
            address:"Rohi",
            img:"img"

        }
    ]
  return (
     <div className={s.container}>
          
          <div className={s.table}>
            <table className={s.tournamenttable}>
              <thead>
                <tr>
                    <th>No</th>
                  <th>Pic</th>
                  <th>Name</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {data.map((person, index) => (
                  <tr>
                    <td>{index + 1}</td>
                    <td>{person.img}</td>

                    <td>{person.name}</td>
                    <td>{person.address}</td>
    
                   
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
  )
}

export default Persons
