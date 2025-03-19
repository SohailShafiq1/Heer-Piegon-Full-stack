import React, { useState } from "react";
import style from "./news.module.css";
import { IoAddCircleOutline } from "react-icons/io5";
import { FaMinusCircle } from "react-icons/fa";
const s = style;
const News = () => {
  const [add, addNews] = React.useState(false);
  const openAdd = () => {
    addNews(!add);
  };
  const [data,setData] = useState([
    { name: "News" },
    { name: "News 02" },
    { name: "Rawalpindi" },
    { name: "Multan" },
  ]);
  const removeItem = (index)=>
    {
    const updatedData = data.filter((_,i) =>i!==index)
    setData(updatedData )
    }
  return (
    <div className={s.container}>
      <div className={s.top}>
        <h1>News</h1>
        <IoAddCircleOutline className={s.add} onClick={openAdd} />
      </div>
      {add && (
        <div className={s.addNews}>
          <textarea
            className={s.writeNews}
            type="text"
            placeholder="Enter News"
          />
          <button className={s.saveNews} onClick={openAdd}>
            Save
          </button>
        </div>
      )}
      <div className={s.table}>
        <table className={s.tournamenttable}>
          <thead>
            <tr>
              <th>Count</th>
              <th>Name</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {data.map((tournament, index) => (
              <tr>
                <td>{index + 1}</td>
                <td>{tournament.name}</td>

                <td>
                  <FaMinusCircle className={s.remove} onClick={()=>{removeItem(index)}} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default News;