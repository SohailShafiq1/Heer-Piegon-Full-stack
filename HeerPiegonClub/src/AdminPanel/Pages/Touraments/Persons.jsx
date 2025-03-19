import React, { useState } from "react";
import style from "./person.module.css";
import { BiEdit } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const s = style;

const Persons = () => {
  const data = [
    { name: "Sohail", address: "Rohi", img: "img" },
    { name: "Israr", address: "Kali Patha", img: "img" },
  ];
  
  const [editTournament, setEditTournament] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPigeon, setSelectedPigeon] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [pigeonData, setPigeonData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const editing = (person) => {
    setSelectedPerson(person);
    setEditTournament(true);
    setErrorMessage(""); // Clear errors when opening the form
  };

  const calculateFlightTime = (start, end) => {
    if (!start || !end) return "00:00:00";

    const startTime = new Date(`1970-01-01T${start}`);
    const endTime = new Date(`1970-01-01T${end}`);

    let diff = endTime - startTime;
    if (diff < 0) diff += 24 * 60 * 60 * 1000; // Handle case where end time is on the next day

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const savePigeonData = () => {
    if (!selectedPerson) return;

    // Check if the pigeon has already been entered for this date
    const isDuplicate = pigeonData.some(
      (entry) => entry.date === selectedDate && entry.pigeon === selectedPigeon
    );

    if (isDuplicate) {
      setErrorMessage("This pigeon has already been entered for this date.");
      return;
    }

    // Validate time input
    if (startTime >= endTime) {
      setErrorMessage("Start time must be earlier than end time.");
      return;
    }

    const flightTime = calculateFlightTime(startTime, endTime);
    setPigeonData([
      ...pigeonData,
      {
        owner: selectedPerson.name,
        date: selectedDate,
        pigeon: selectedPigeon,
        startTime,
        endTime,
        flightTime,
      },
    ]);

    setEditTournament(false);
    setSelectedDate("");
    setSelectedPigeon("");
    setStartTime("");
    setEndTime("");
    setSelectedPerson(null);
    setErrorMessage(""); // Clear errors after saving
  };
  const navigate = useNavigate();


  const sendingData = () => {
    const newData = {
      owner: selectedPerson.name,
      date: selectedDate,
      pigeon: selectedPigeon,
     
      flightTime,
    };
  
    setPigeonData(prevData => [...prevData, newData]); 
  
    navigate("./NameOfCup", { state: newData }); 
  };
  
  
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
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {data.map((person, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{person.img}</td>
                <td>{person.name}</td>
                <td>{person.address}</td>
                <td>
                  <BiEdit className={s.edit} onClick={() => editing(person)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editTournament && selectedPerson && (
        <div className={s.popup}>
          <h1>Edit Details for {selectedPerson.name}</h1>
          
          {errorMessage && <p className={s.error}>{errorMessage}</p>} {/* Show error message */}

          <h3>Select Date</h3>
          <input
            type="date"
            className={s.select}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <h3>Select Pigeon</h3>
          <select
            className={s.select}
            value={selectedPigeon}
            onChange={(e) => setSelectedPigeon(e.target.value)}
          >
            <option value="">Select Pigeon</option>
            <option value="Pigeon 1">Pigeon 1</option>
            <option value="Pigeon 2">Pigeon 2</option>
            <option value="Pigeon 3">Pigeon 3</option>
            <option value="Pigeon 4">Pigeon 4</option>
            <option value="Pigeon 5">Pigeon 5</option>
            <option value="Pigeon 6">Pigeon 6</option>
            <option value="Pigeon 7">Pigeon 7</option>
            <option value="Pigeon 8">Pigeon 8</option>
          </select>

          <div className={s.dates}>
            <div>
              <h2>Start Time</h2>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <h2>End Time</h2>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className={s.button}>
            <button className={s.cancelbtn} onClick={() => setEditTournament(false)}>
              Cancel
            </button>
            <button className={s.addbtn} onClick={savePigeonData}>
              Save
            </button>
          </div>
        </div>
      )}

      <div className={s.savedData}>
        <h2>Saved Pigeon Data</h2>
        <ul>
          {pigeonData.map((item, index) => (
            <li key={index}>
              <strong>Owner:</strong> {item.owner} | <strong>Date:</strong> {item.date} |{" "}
              <strong>Pigeon:</strong> {item.pigeon} | <strong>Start Time:</strong> {item.startTime} |{" "}
              <strong>End Time:</strong> {item.endTime} | <strong>Flight Time:</strong> {item.flightTime}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Persons;
