import React, { useState, useEffect } from "react";
import axios from "axios";
import style from "./news.module.css";
import { IoAddCircleOutline } from "react-icons/io5";
import { MdOutlineDone, MdDelete } from "react-icons/md";
import { ImCross } from "react-icons/im";

const s = style;

const News = () => {
  const [add, setAdd] = useState(false);
  const [newsText, setNewsText] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/news");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching news", err);
    }
  };

  const saveNews = async () => {
    if (!newsText.trim()) return;
    try {
      await axios.post("http://localhost:5001/api/news", { text: newsText });
      setNewsText("");
      setAdd(false);
      fetchNews();
    } catch (err) {
      console.error("Error saving news", err);
    }
  };

  const togglePublish = async (id) => {
    try {
      await axios.put(`http://localhost:5001/api/news/${id}/toggle-publish`);
      fetchNews();
    } catch (err) {
      console.error("Error toggling publish status", err);
    }
  };

  const deleteNews = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/news/${id}`);
      fetchNews();
    } catch (err) {
      console.error("Error deleting news", err);
    }
  };

  return (
    <div className={s.container}>
      <div className={s.top}>
        <h1>News</h1>
        <IoAddCircleOutline className={s.add} onClick={() => setAdd(!add)} />
      </div>

      {add && (
        <div className={s.addNews}>
          <textarea
            className={s.writeNews}
            value={newsText}
            onChange={(e) => setNewsText(e.target.value)}
            placeholder="Enter News"
          />
          <button className={s.saveNews} onClick={saveNews}>
            Save
          </button>
        </div>
      )}

      <div className={s.table}>
        <table className={s.tournamenttable}>
          <thead>
            <tr>
              <th>Count</th>
              <th>News Name</th>
              <th>Text</th>
              <th>Publish</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item._id}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.text}</td>
                <td className={s.actions}>
                  <button
                    className={item.published ? s.publish : s.unpublish}
                    onClick={() => togglePublish(item._id)}
                  >
                    {item.published ? <MdOutlineDone /> : <ImCross />}
                  </button>
                </td>
                <td>
                  <div
                    className={s.delete}
                    onClick={() => deleteNews(item._id)}
                  >
                    <MdDelete />
                  </div>
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
