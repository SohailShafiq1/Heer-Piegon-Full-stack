import React, { useState, useEffect } from "react";
import axios from "axios";
import style from "./nameofcup.module.css";
const s = style;

const NameOfCup = () => {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [participants, setParticipants] = useState([]);
  const [flightData, setFlightData] = useState({});
  const [news, setNews] = useState([]);

  useEffect(() => { 
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/news");
      // Only show published news
      setNews(res.data.filter((item) => item.published));
    } catch (err) {
      console.error("Error fetching news", err);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchParticipants(selectedTournament);
    }
  }, [selectedTournament]);

  useEffect(() => {
    if (selectedTournament) {
      participants.forEach((participant) => fetchFlightData(participant._id));
    }
  }, [selectedTournament, participants]);

  const fetchTournaments = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/tournaments");
      setTournaments(res.data);
    } catch (err) {
      console.error("Error fetching tournaments", err);
    }
  };

  const fetchParticipants = async (tournamentId) => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/tournaments/${tournamentId}/participants`
      );
      setParticipants(res.data);
    } catch (err) {
      console.error("Error fetching participants", err);
    }
  };

  const fetchFlightData = async (participantId) => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/participants/${participantId}/flights`
      );

      if (res.data.flightData) {
        setFlightData((prevData) => ({
          ...prevData,
          [participantId]: res.data.flightData,
        }));
      }
    } catch (err) {
      console.error("Error fetching flight data", err);
    }
  };

  // Convert flight time from seconds to HH:MM:SS format
  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return "-";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className={s.container}>
      <div className={s.controls}>
        <div className={s.selecting}> 
          
        <h2>Select Tournament:</h2>
        <select
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(e.target.value)}
          selected={tournaments._id === 1}
        >
          <option value="">-- Select --</option>
          {tournaments.map((tournament) => (
            <option key={tournament._id} value={tournament._id}>
              {tournament.name}
            </option>
          ))}
        </select>

        {selectedTournament && (
          <>
            <h2>Select Date:</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={
                tournaments.find((t) => t._id === selectedTournament)?.startDate
              }
              max={
                tournaments.find((t) => t._id === selectedTournament)?.endDate
              }
            />
          </>
        )}
        </div>
        <div className={s.newsbox}>
          <h2>
            {news.map((item) => (
              <div key={item._id}>{item.text}</div>
            ))}
          </h2>
        </div>
      </div>

      <div className={s.participant}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Picture</th>
            <th>Name</th>
            <th>Address</th>
            {Array.from(
              {
                length:
                  tournaments.find((t) => t._id === selectedTournament)
                    ?.pigeons || 0,
              },
              (_, i) => (
                <th key={i}>{`Pigeon ${i + 1}`}</th>
              )
            )}
            <th>Total Flight Time</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((participant) => {
            const participantFlights = flightData[participant._id] || [];

            // Filter flight data for the selected date
            const selectedDateFlights = participantFlights.filter(
              (f) =>
                new Date(f.date).toISOString().split("T")[0] === selectedDate
            );

            // Calculate total flight time across all dates
            const totalFlightTime = participantFlights.reduce(
              (acc, flight) => acc + (parseFloat(flight.flightTime) || 0),
              0
            );

            // Get the number of allowed pigeons in this tournament
            const allowedPigeons =
              tournaments.find((t) => t._id === selectedTournament)?.pigeons ||
              0;

            return (
              <tr key={participant._id}>
                <td className={s.img}>
                  <img
                    src={participant.imagePath}
                    alt={participant.name || "Unknown"}
                    
                  />
                </td>
                <td className={s.nameOfPersons}>{participant.name}</td>
                
                <td>{participant.address}</td>

                {/* Display only the allowed number of pigeons */}
                {Array.from({ length: allowedPigeons }, (_, i) => {
                  const pigeon = participant.pigeons[i]; // Get pigeon if exists
                  const flight = selectedDateFlights.find(
                    (f) => f.pigeon === pigeon
                  );

                  return (
                    <td key={i}>
                      {pigeon
                        ? flight
                          ? flight.lofted
                            ? "Lofted"
                            : formatTime(flight.flightTime)
                          : "-"
                        : "N/A"}
                    </td>
                  );
                })}

                <td>{formatTime(totalFlightTime)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

</div>
         </div>
  );
};

export default NameOfCup;
