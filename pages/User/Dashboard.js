import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSignalR } from "../../SignalRContext";
import { useTranslation } from "react-i18next";
import UserSidebar from "./UserSidebar";
import "./css/Dashboard.css";
import { fetchAquariums } from "../../api/userAquarium";

function Dashboard() {
  const { t, i18n } = useTranslation();
  const [aquariums, setAquariums] = useState([]);
  const [loading, setLoading] = useState(true);
  const connection = useSignalR();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadAquariums = async () => {
      try {
        const data = await fetchAquariums(token);
        const formattedAquariums = data.map((aq) => ({
          id: Number(aq.id || aq.Id),
          name: aq.name || aq.Name || t("noName"),
          description: aq.description || aq.Description || "",
          temperature: aq.temperature ?? aq.Temperature,
          isLightOn: aq.isLightOn ?? aq.IsLightOn,
          lastFeedTime: aq.lastFeedTime || aq.LastFeedTime,
        }));
        setAquariums(formattedAquariums);
      } catch (e) {
        console.error("Dashboard: Error fetching aquariums:", e);
      } finally {
        setLoading(false);
      }
    };
    loadAquariums();
  }, [t, token]);

  useEffect(() => {
    if (!connection) return;

    const onTemp = (data) => {
      if (
        typeof data?.aquariumId !== "number" ||
        typeof data?.temperature !== "number"
      )
        return;
      setAquariums((current) =>
        current.map((aq) =>
          aq.id === data.aquariumId ? { ...aq, temperature: data.temperature } : aq
        )
      );
    };

    const onLight = (data) => {
      if (
        typeof data?.aquariumId !== "number" ||
        typeof data?.isLightOn !== "boolean"
      )
        return;
      setAquariums((current) =>
        current.map((aq) =>
          aq.id === data.aquariumId ? { ...aq, isLightOn: data.isLightOn } : aq
        )
      );
    };

    const onFeed = (data) => {
      if (
        typeof data?.aquariumId !== "number" ||
        typeof data?.lastFeedTime !== "string"
      )
        return;
      setAquariums((current) =>
        current.map((aq) =>
          aq.id === data.aquariumId ? { ...aq, lastFeedTime: data.lastFeedTime } : aq
        )
      );
    };

    connection.on("ReceiveTemperatureUpdate", onTemp);
    connection.on("ReceiveLightUpdate", onLight);
    connection.on("ReceiveFeedUpdate", onFeed);

    return () => {
      connection.off("ReceiveTemperatureUpdate", onTemp);
      connection.off("ReceiveLightUpdate", onLight);
      connection.off("ReceiveFeedUpdate", onFeed);
    };
  }, [connection]);

  if (loading) return <div className="loading">{t("loading")}</div>;

  return (
    <div className="user-layout">
      <UserSidebar />
      <div className="user-content">
        <h2>{t("myAquariums")}</h2>
        <Link to="/user/create" className="btn-create">
          {t("addAquarium")}
        </Link>
        <div className="aquarium-list">
          {aquariums.length === 0 ? (
            <p>{t("noAquariums")}</p>
          ) : (
            aquariums.map((aq) => (
              <Link to={`/user/aquarium/${aq.id}`} className="aquarium-card" key={aq.id}>
                <h3>{aq.name}</h3>
                <p>{aq.description || t("noDescription")}</p>
                <div>
                  {t("temperature")}:{" "}
                  {aq.temperature != null ? `${aq.temperature.toFixed(1)}°C` : "N/A"}
                </div>
                <div>
                  {t("light")}:{" "}
                  {aq.isLightOn != null ? (aq.isLightOn ? t("enabled") : t("disabled")) : "N/A"}
                </div>
                <div>
                  {t("lastFeeding")}:{" "}
                  {aq.lastFeedTime
                    ? new Date(aq.lastFeedTime + "Z").toLocaleString(
                        i18n.language === "uk" ? "uk-UA" : "en-US"
                      )
                    : "—"}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;