import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import UserSidebar from "./UserSidebar";
import "./css/History.css";
import { fetchAquariumHistory } from '../../api/userAquarium';

function History() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchAquariumHistory(id, token);
        setHistory(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [id, token]);

  if (loading) return <div className="loading">{t("loading")}</div>;

  return (
    <div className="user-layout">
      <UserSidebar />
      <div className="user-content">
        <h2>{t("history")}</h2>
        <Link to={`/user/aquarium/${id}`}>{t("back")}</Link>
        <table className="history-table">
          <thead>
            <tr>
              <th>{t("date")}</th>
              <th>{t("temperature")}</th>
              <th>{t("light")}</th>
              <th>{t("lastFeeding")}</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, idx) => (
              <tr key={idx}>
                <td>
                  {new Date(h.timestamp + "Z").toLocaleString(
                    i18n.language === "uk" ? "uk-UA" : "en-US"
                  )}
                </td>
                <td>{h.temperature}°C</td>
                <td>{h.lightStatus ? t("enabled") : t("disabled")}</td>
                <td>
                  {h.lastFeedTime
                    ? new Date(h.lastFeedTime + "Z").toLocaleString(
                        i18n.language === "uk" ? "uk-UA" : "en-US"
                      )
                    : t("notAvailable")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default History;