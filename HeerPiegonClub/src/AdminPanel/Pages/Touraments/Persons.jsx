import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import style from "./person.module.css";
import { BiEdit } from "react-icons/bi";
import { AiOutlineDelete } from "react-icons/ai";

const s = style;

const Persons = () => {
  const { id: tournamentId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [editParticipant, setEditParticipant] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPigeon, setSelectedPigeon] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [tournamentDates, setTournamentDates] = useState({
    startDate: "",
    endDate: "",
  });

  const loftPigeon = async () => {
    if (!selectedPigeon) {
      setErrorMessage("Please select a pigeon.");
      return;
    }
    if (!selectedDate) {
      setErrorMessage("Please select a date.");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5001/api/participants/${selectedPerson._id}/flight`,
        {
          date: selectedDate,
          pigeon: selectedPigeon,
          lofted: true, // ✅ Added lofted flag
        }
      );

      setParticipants((prev) =>
        prev.map((p) =>
          p._id === selectedPerson._id
            ? {
                ...p,
                flightData: [
                  ...(p.flightData || []).filter(
                    (f) =>
                      !(f.date === selectedDate && f.pigeon === selectedPigeon)
                  ),
                  {
                    date: selectedDate,
                    pigeon: selectedPigeon,
                    startTime: null,
                    endTime: null,
                    flightTime: "loft",
                    lofted: true, // ✅ Add lofted flag
                  },
                ],
              }
            : p
        )
      );

      setEditParticipant(false);
    } catch (error) {
      console.error("Error lofting pigeon:", error);
      setErrorMessage("Failed to mark pigeon as lofted.");
    }
  };

  // Fetch tournament details (start & end date)
  useEffect(() => {
    if (!tournamentId) return;

    axios
      .get(`http://localhost:5001/api/tournaments/${tournamentId}`)
      .then(({ data }) => {
        setTournamentDates({
          startDate: data.startDate?.split("T")[0] || "",
          endDate: data.endDate?.split("T")[0] || "",
        });
      })
      .catch((error) => {
        console.error("Error fetching tournament dates:", error);
        setErrorMessage("Failed to fetch tournament dates.");
      });
  }, [tournamentId]);

  // Fetch participants of the tournament
  useEffect(() => {
    if (!tournamentId) return;

    setLoading(true);
    axios
      .get(`http://localhost:5001/api/tournaments/${tournamentId}/participants`)
      .then(({ data }) => setParticipants(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error("Error fetching participants:", error);
        setErrorMessage("Failed to load participants.");
      })
      .finally(() => setLoading(false));
  }, [tournamentId]);

  // Open edit form
  const handleEdit = (person) => {
    setSelectedPerson(person);
    setSelectedDate("");
    setSelectedPigeon("");
    setStartTime("");
    setEndTime("");
    setEditParticipant(true);
    setErrorMessage("");
  };

  // Fetch flight data when date or pigeon changes
  useEffect(() => {
    if (!selectedPerson || !selectedDate || !selectedPigeon) return;

    axios
      .get(
        `http://localhost:5001/api/participants/${selectedPerson._id}/flight`,
        { params: { date: selectedDate, pigeon: selectedPigeon } }
      )
      .then(({ data }) => {
        if (data.lofted) {
          setStartTime("");
          setEndTime("");
        } else if (data.startTime && data.endTime) {
          setStartTime(data.startTime);
          setEndTime(data.endTime);
        } else {
          setStartTime("");
          setEndTime("");
        }
      })
      .catch((error) => {
        console.error("Error fetching flight data:", error);
        setErrorMessage("Failed to fetch flight data.");
      });
  }, [selectedDate, selectedPigeon, selectedPerson]);

  // Delete participant
  const deleteParticipant = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/participants/${id}`);
      setParticipants((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Error deleting participant:", error);
      setErrorMessage("Error deleting participant. Please try again.");
    }
  };

  // Save pigeon flight data
  const savePigeonData = async () => {
    if (!selectedPigeon) {
      setErrorMessage("Please select a pigeon.");
      return;
    }
    if (!selectedDate || !startTime || !endTime) {
      setErrorMessage("All fields are required.");
      return;
    }
    if (endTime <= startTime) {
      setErrorMessage(
        "End time cannot be earlier than or equal to start time."
      );
      return;
    }

    try {
      const { data } = await axios.post(
        `http://localhost:5001/api/participants/${selectedPerson._id}/flight`,
        { date: selectedDate, pigeon: selectedPigeon, startTime, endTime }
      );

      setParticipants((prev) =>
        prev.map((p) =>
          p._id === selectedPerson._id
            ? {
                ...p,
                flightData: [
                  ...(p.flightData || []).filter(
                    (f) =>
                      !(f.date === selectedDate && f.pigeon === selectedPigeon)
                  ),
                  data,
                ],
              }
            : p
        )
      );

      setEditParticipant(false);
    } catch (error) {
      console.error("Error saving flight data:", error);
      setErrorMessage("Failed to save flight data. Please try again.");
    }
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
              <th>Pigeons</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className={s.loading}>
                  Loading participants...
                </td>
              </tr>
            ) : participants.length > 0 ? (
              participants.map((person, index) => (
                <tr key={person._id}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={person.imagePath}
                      alt={person.name || "Unknown"}
                      className={s.img}
                    />
                  </td>
                  <td>{person.name || "N/A"}</td>
                  <td>{person.address || "No address available"}</td>
                  <td>{person.pigeons?.length || 0}</td>
                  <td>
                    <BiEdit
                      className={s.edit}
                      onClick={() => handleEdit(person)}
                    />
                  </td>
                  <td>
                    <AiOutlineDelete
                      className={s.delete}
                      onClick={() => deleteParticipant(person._id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className={s.noData}>
                  No participants found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Participant Popup */}
      {editParticipant && selectedPerson && (
        <div className={s.popup}>
          <h1>Edit Details for {selectedPerson.name}</h1>
          {errorMessage && <p className={s.error}>{errorMessage}</p>}
          <h3>Select Date</h3>
          <input
            type="date"
            value={selectedDate}
            min={tournamentDates.startDate}
            max={tournamentDates.endDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <h3>Select Pigeon</h3>
          <select
            className={s.inputs}
            value={selectedPigeon}
            onChange={(e) => setSelectedPigeon(e.target.value)}
          >
            <option value="">Select a Pigeon</option>
            {selectedPerson.pigeons?.map((pigeon, index) => (
              <option key={index} value={pigeon}>
                {pigeon}
              </option>
            ))}
          </select>
          {selectedPigeon && selectedDate && (
            <p>
              {selectedPerson.flightData?.find(
                (f) => f.date === selectedDate && f.pigeon === selectedPigeon
              )?.lofted
                ? "Pigeon is lofted"
                : ""}
            </p>
          )}
          {!selectedPerson.flightData?.find(
            (f) => f.date === selectedDate && f.pigeon === selectedPigeon
          )?.lofted && (
            <div className={s.dates}>
              <h3>Start Time</h3>
              <input
                className={s.datesInput}
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          )}
          {!selectedPerson.flightData?.find(
            (f) => f.date === selectedDate && f.pigeon === selectedPigeon
          )?.lofted && (
            <div className={s.dates}>
              <h3>End Time</h3>
              <input
                className={s.datesInput}
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          )}
          <div className={s.button}>
            {!selectedPerson.flightData?.find(
              (f) => f.date === selectedDate && f.pigeon === selectedPigeon
            )?.lofted && (
              <button className={s.loft} onClick={loftPigeon}>
                Mark as Lofted
              </button>
            )}

            <button
              className={s.cancel}
              onClick={() => setEditParticipant(false)}
            >
              Cancel
            </button>
            <button className={s.save} onClick={savePigeonData}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Persons;
