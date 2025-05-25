import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSignalR } from "../../SignalRContext";
import UserSidebar from "./UserSidebar";
import "./css/AquariumDetails.css";

import {
  fetchAquariumById,
  fetchSchedule,
  deleteAquarium,
  toggleLight,
  feedFish,
  saveSchedule,
} from "../../api/userAquarium";

import {
  formatToLocalInputTime,
  formatToUtcTimeStr,
  formatUtcToRegion,
} from "../../helpers/timeFormatter";

function AquariumDetails() {
  const { t, i18n } = useTranslation();
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const connection = useSignalR();

  const aquariumIdFromParam = Number(paramId);

  const [aquarium, setAquarium] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [scheduleSettings, setScheduleSettings] = useState({
    isScheduleEnabled: false,
    feedIntervalHours: null,
    feedTimes: [],
    lightOnTime: "",
    lightOffTime: "",
  });
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  // Завантаження акваріума
  useEffect(() => {
    async function loadAquarium() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAquariumById(aquariumIdFromParam, localStorage.getItem("token"));
        setAquarium({
          id: Number(data.id || data.Id),
          name: data.name || data.Name || t("notAvailable"),
          description: data.description || data.Description || "",
          temperature: data.temperature ?? data.Temperature,
          isLightOn: data.isLightOn ?? data.IsLightOn,
          lastFeedTime: data.lastFeedTime || data.LastFeedTime,
        });
      } catch (err) {
        if (err.status === 404) setError(t("notFound"));
        else setError(`${t("notFound")} (status: ${err.status || "error"})`);
        setAquarium(null);
      } finally {
        setLoading(false);
      }
    }
    if (!isNaN(aquariumIdFromParam) && aquariumIdFromParam > 0) {
      loadAquarium();
    } else {
      setError(t("invalidId"));
      setLoading(false);
    }
  }, [aquariumIdFromParam, t]);

  // Завантаження розкладу
  const fetchScheduleSettings = useCallback(async () => {
    if (isNaN(aquariumIdFromParam) || aquariumIdFromParam <= 0) return;
    setScheduleLoading(true);
    setScheduleError("");
    try {
      const data = await fetchSchedule(aquariumIdFromParam, localStorage.getItem("token"));
      setScheduleSettings({
        isScheduleEnabled: data.isScheduleEnabled || false,
        feedIntervalHours: data.feedIntervalHours || null,
        feedTimes: (data.feedTimes || []).map(formatToLocalInputTime).filter(Boolean),
        lightOnTime: formatToLocalInputTime(data.lightOnTime),
        lightOffTime: formatToLocalInputTime(data.lightOffTime),
      });
    } catch (err) {
      setScheduleError(t("saveError"));
    } finally {
      setScheduleLoading(false);
    }
  }, [aquariumIdFromParam, t]);

  useEffect(() => {
    fetchScheduleSettings();
  }, [fetchScheduleSettings]);

  // SignalR оновлення
  useEffect(() => {
    if (!connection || isNaN(aquariumIdFromParam) || aquariumIdFromParam <= 0) return;

    const onTemp = (data) => {
      if (data.aquariumId === aquariumIdFromParam && typeof data.temperature === "number") {
        setAquarium((curr) => (curr ? { ...curr, temperature: data.temperature } : null));
      }
    };
    const onLight = (data) => {
      if (data.aquariumId === aquariumIdFromParam && typeof data.isLightOn === "boolean") {
        setAquarium((curr) => (curr ? { ...curr, isLightOn: data.isLightOn } : null));
      }
    };
    const onFeed = (data) => {
      if (data.aquariumId === aquariumIdFromParam && typeof data.lastFeedTime === "string") {
        setAquarium((curr) => (curr ? { ...curr, lastFeedTime: data.lastFeedTime } : null));
      }
    };

    connection.on("ReceiveTemperatureUpdate", onTemp);
    connection.on("ReceiveLightUpdate", onLight);
    connection.on("ReceiveFeedUpdate", onFeed);

    return () => {
      connection.off("ReceiveTemperatureUpdate", onTemp);
      connection.off("ReceiveLightUpdate", onLight);
      connection.off("ReceiveFeedUpdate", onFeed);
    };
  }, [connection, aquariumIdFromParam]);

  // Видалення акваріума
  const handleDelete = async () => {
    if (!window.confirm(t("deleteConfirm"))) return;
    setError("");
    try {
      await deleteAquarium(aquariumIdFromParam, localStorage.getItem("token"));
      navigate("/user");
    } catch (err) {
      setError(t("saveError"));
    }
  };

  // Кнопки управління
  const handleTurnLight = async () => {
    setActionLoading(true);
    setActionMessage("");
    try {
      const msg = await toggleLight(aquariumIdFromParam, localStorage.getItem("token"));
      setActionMessage(msg || t("lightToggled"));
    } catch {
      setActionMessage(t("actionError"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeedFish = async () => {
    setActionLoading(true);
    setActionMessage("");
    try {
      const msg = await feedFish(aquariumIdFromParam, localStorage.getItem("token"));
      setActionMessage(msg || t("fishFed"));
    } catch {
      setActionMessage(t("actionError"));
    } finally {
      setActionLoading(false);
    }
  };

  // Обробники форми розкладу
  const handleScheduleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setScheduleSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFeedTimeChange = (index, value) => {
    const newFeedTimes = [...scheduleSettings.feedTimes];
    newFeedTimes[index] = value;
    setScheduleSettings((prev) => ({ ...prev, feedTimes: newFeedTimes }));
  };

  const addFeedTime = () => {
    if (scheduleSettings.feedTimes.length < 5) {
      setScheduleSettings((prev) => ({
        ...prev,
        feedTimes: [...prev.feedTimes, ""],
      }));
    } else {
      alert(t("addFeedTime"));
    }
  };

  const removeFeedTime = (index) => {
    setScheduleSettings((prev) => ({
      ...prev,
      feedTimes: prev.feedTimes.filter((_, i) => i !== index),
    }));
  };

  // Збереження розкладу
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (isNaN(aquariumIdFromParam) || aquariumIdFromParam <= 0) return;
    setScheduleLoading(true);
    setScheduleError("");

    const payload = {
      isScheduleEnabled: scheduleSettings.isScheduleEnabled,
      feedIntervalHours: scheduleSettings.feedIntervalHours
        ? Number(scheduleSettings.feedIntervalHours)
        : null,
      feedTimes: scheduleSettings.feedTimes
        .map(formatToUtcTimeStr)
        .filter(Boolean),
      lightOnTime: formatToUtcTimeStr(scheduleSettings.lightOnTime),
      lightOffTime: formatToUtcTimeStr(scheduleSettings.lightOffTime),
    };

    try {
      await saveSchedule(aquariumIdFromParam, localStorage.getItem("token"), payload);
      alert(t("saveSuccess"));
      fetchScheduleSettings();
    } catch (err) {
      setScheduleError(
        `${t("saveError")}: ${err.message || err.statusText || ""}`
      );
    } finally {
      setScheduleLoading(false);
    }
  };

  if (loading) return <div className="loading">{t("loading")}</div>;
  if (error) return <div className="error">{error}</div>;
  if (!aquarium) return <div>{t("notFound")}</div>;

return (
    <div className="user-layout">
      <UserSidebar />
      <div className="user-content">
        <h2>{aquarium.name}</h2>
        <p>{t('description')}: {aquarium.description}</p>
        <div>{t('temperature')}: {aquarium.temperature != null ? `${aquarium.temperature.toFixed(1)}°C` : t('notAvailable')}</div>
        <div>{t('light')}: {aquarium.isLightOn != null ? (aquarium.isLightOn ? t('enabled') : t('disabled')) : t('notAvailable')}</div>
        <div>
          {t('lastFeeding')}: {aquarium.lastFeedTime
            ? formatUtcToRegion(aquarium.lastFeedTime, i18n.language)
            : t('notAvailable')}
        </div>
        <div className="actions">
          <Link to={`/user/history/${aquarium.id}`}>{t('history')}</Link>
          <button onClick={handleDelete} className="btn-delete">{t('delete')}</button>
          <button
            onClick={handleFeedFish}
            className="btn-feed"
            disabled={actionLoading}
            style={{ marginLeft: 8 }}
          >
            {t('feed')}
          </button>
          <button
            onClick={handleTurnLight}
            className="btn-light"
            disabled={actionLoading}
            style={{ marginLeft: 8 }}
          >
            {t('toggleLight')}
          </button>
        </div>
        {actionMessage && <div className="action-message">{actionMessage}</div>}

        <hr className="section-divider" />

        <h3>{t('scheduleSettings')}</h3>
        {scheduleLoading && <div className="loading">{t('scheduleLoading')}</div>}
        {scheduleError && <div className="error schedule-error">{scheduleError}</div>}
      
        <form onSubmit={handleSaveSchedule} className="schedule-form">
          <div className="form-group checkbox-group">
            <label htmlFor="isScheduleEnabled">
              <input
                type="checkbox"
                id="isScheduleEnabled"
                name="isScheduleEnabled"
                checked={scheduleSettings.isScheduleEnabled}
                onChange={handleScheduleChange}
              />
              {t('enableSchedule')}
            </label>
          </div>

          <h4>{t('light')}</h4>
          <div className="form-group">
            <label htmlFor="lightOnTime">{t('lightOnTime')}:</label>
            <input
              type="time"
              id="lightOnTime"
              name="lightOnTime"
              value={scheduleSettings.lightOnTime}
              onChange={handleScheduleChange}
              disabled={!scheduleSettings.isScheduleEnabled}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lightOffTime">{t('lightOffTime')}:</label>
            <input
              type="time"
              id="lightOffTime"
              name="lightOffTime"
              value={scheduleSettings.lightOffTime}
              onChange={handleScheduleChange}
              disabled={!scheduleSettings.isScheduleEnabled}
            />
          </div>

          <h4>{t('feedTimes')}</h4>
          <div className="feed-times-group">
            {scheduleSettings.feedTimes.map((time, index) => (
              <div key={index} className="feed-time-item">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => handleFeedTimeChange(index, e.target.value)}
                  disabled={!scheduleSettings.isScheduleEnabled}
                />
                <button 
                  type="button" 
                  onClick={() => removeFeedTime(index)} 
                  className="btn-remove-time"
                  disabled={!scheduleSettings.isScheduleEnabled}
                >
                  {t('remove')}
                </button>
              </div>
            ))}
            {scheduleSettings.feedTimes.length < 5 && (
              <button 
                type="button" 
                onClick={addFeedTime} 
                className="btn-add-time"
                disabled={!scheduleSettings.isScheduleEnabled}
              >
                {t('addFeedTime')}
              </button>
            )}
          </div>
        
          <button
            type="submit"
            className="btn-save-schedule"
            disabled={scheduleLoading}
          >
            {scheduleLoading ? t('loading') : t('saveSchedule')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AquariumDetails;