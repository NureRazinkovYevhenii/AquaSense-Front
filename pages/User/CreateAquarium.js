import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import UserSidebar from "./UserSidebar";
import "./css/CreateAquarium.css";
import { createAquarium } from "../../api/userAquarium";

function CreateAquarium() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createAquarium({ name, description }, token);
      navigate("/user");
    } catch (e) {
      setError(t("createFailed"));
    }
  };

  return (
    <div className="user-layout">
      <UserSidebar />
      <div className="user-content">
        <h2>{t("addAquarium")}</h2>
        <form onSubmit={handleSubmit} className="create-form">
          <input
            type="text"
            placeholder={t("name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            placeholder={t("description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit">{t("create")}</button>
          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default CreateAquarium;