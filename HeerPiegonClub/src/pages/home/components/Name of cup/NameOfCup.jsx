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
  const [sortedParticipants, setSortedParticipants] = useState([]);
  const [winner, setWinner] = useState(null);
  const [maxPigeons, setMaxPigeons] = useState(0);

  useEffect(() => {
    fetchNews();
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchParticipants(selectedTournament);
      const tournament = tournaments.find((t) => t._id === selectedTournament);
      setMaxPigeons(tournament?.pigeons || 0);
    }
  }, [selectedTournament, tournaments]);

  useEffect(() => {
    if (selectedTournament && participants.length > 0) {
      participants.forEach((participant) => fetchFlightData(participant._id));
    }
  }, [selectedTournament, participants]);

  useEffect(() => {
    calculateWinnerAndSort();
  }, [flightData, participants]);

  const fetchNews = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/news");
      setNews(res.data.filter((item) => item.published));
    } catch (err) {
      console.error("Error fetching news", err);
    }
  };

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
  const calculateWinnerAndSort = () => {
    if (participants.length === 0) return;

    const tournament = tournaments.find((t) => t._id === selectedTournament);
    if (!tournament) return;

    const startDate = new Date(tournament.startDate);
    const endDate = new Date(tournament.endDate);
    const allowedPigeons = tournament.pigeons || 0;

    const participantsWithTotalTime = participants.map((participant) => {
      const flights = flightData[participant._id] || [];

      let totalFlightTime = 0;
      let loftedExists = false;
      let firstPigeonTimeOnFirstDate = null;
      let earliestDate = null;

      const groupedFlights = {};
      flights.forEach((flight) => {
        const dateKey = new Date(flight.date).toISOString().split("T")[0];
        if (!groupedFlights[dateKey]) groupedFlights[dateKey] = [];
        groupedFlights[dateKey].push({
          time: parseFloat(flight.flightTime) || 0,
          lofted: flight.lofted || false,
          pigeonNumber: flight.pigeonNumber,
        });
      });

      // Find the first recorded date
      const recordedDates = Object.keys(groupedFlights).sort();
      earliestDate = recordedDates.length > 0 ? recordedDates[0] : null;

      let totalDaysWithData = recordedDates.length;
      let tournamentDays = 0;
      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        tournamentDays++;
      }

      let hasAllDaysData = totalDaysWithData >= tournamentDays;

      Object.entries(groupedFlights).forEach(([date, flightsPerDay]) => {
        flightsPerDay.sort((a, b) => a.pigeonNumber - b.pigeonNumber);
        const validFlights = flightsPerDay.slice(0, allowedPigeons);

        if (validFlights.some((flight) => flight.lofted)) {
          loftedExists = true;
        }

        if (date === earliestDate && validFlights.length > 0) {
          firstPigeonTimeOnFirstDate = validFlights[0].time;
        }

        validFlights.forEach((flight) => {
          totalFlightTime += flight.time;
        });
      });

      if (
        hasAllDaysData &&
        !loftedExists &&
        firstPigeonTimeOnFirstDate !== null
      ) {
        totalFlightTime -= firstPigeonTimeOnFirstDate;
        totalFlightTime = Math.max(totalFlightTime, 0);
      }

      return { ...participant, totalFlightTime, flights };
    });

    const sorted = participantsWithTotalTime.sort(
      (a, b) => b.totalFlightTime - a.totalFlightTime
    );

    setSortedParticipants(sorted);
    setWinner(sorted.length > 0 ? sorted[0] : null);
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return "N/A";
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
            onChange={(e) => {
              setSelectedTournament(e.target.value);
              setSelectedDate("");
              setParticipants([]);
              setFlightData({});
              setWinner(null);
              setSortedParticipants([]);
            }}
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
                  tournaments.find((t) => t._id === selectedTournament)
                    ?.startDate
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

      {winner && (
        <div className={s.winner}>
          <h2>🏆 Winner</h2>
          <p>
            <strong>{winner.name}</strong> -{" "}
            {formatTime(winner.totalFlightTime)}
          </p>
        </div>
      )}

      <div className={s.participant}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Picture</th>
              <th>Name</th>
              <th>Address</th>
              {[...Array(maxPigeons).keys()].map((i) => (
                <th key={i}>Pigeon {i + 1}</th>
              ))}
              <th>Total Flight Time</th>
            </tr>
          </thead>
          <tbody>
            {sortedParticipants.map((participant) => {
              const flights = participant.flights || [];
              const selectedDateFlights = flights.filter(
                (f) =>
                  selectedDate &&
                  new Date(f.date).toISOString().split("T")[0] === selectedDate
              );

              return (
                <tr key={participant._id}>
                  <td className={s.img}>
                    <img
                      src={participant.imagePath}
                      alt={participant.name || "Unknown"}
                    />
                  </td>
                  <td>{participant.name}</td>
                  <td>{participant.address}</td>
                  {[...Array(maxPigeons).keys()].map((i) => (
                    <td key={i}>
                      {selectedDate
                        ? selectedDateFlights[i]?.lofted
                          ? "Lofted"
                          : formatTime(selectedDateFlights[i]?.flightTime)
                        : "N/A"}
                    </td>
                  ))}
                  <td>{formatTime(participant.totalFlightTime)}</td>
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
