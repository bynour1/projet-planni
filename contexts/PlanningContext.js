import React, { createContext, useContext, useState } from "react";

export const PlanningContext = createContext();

export const PlanningProvider = ({ children }) => {
  // planning = objet avec jours de la semaine
  const [planning, setPlanning] = useState({
    Lundi: [],
    Mardi: [],
    Mercredi: [],
    Jeudi: [],
    Vendredi: [],
  });

  const addEvent = (jour, medecin, technicien, adresse) => {
    setPlanning((prev) => ({
      ...prev,
      [jour]: [...(prev[jour] || []), { medecin, technicien, adresse }],
    }));
  };

  const removeEvent = (jour, index) => {
    setPlanning((prev) => ({
      ...prev,
      [jour]: prev[jour].filter((_, i) => i !== index),
    }));
  };

  const updateEvent = (jour, index, newEvent) => {
    setPlanning((prev) => {
      const updatedDay = [...prev[jour]];
      updatedDay[index] = newEvent;
      return { ...prev, [jour]: updatedDay };
    });
  };

  return (
    <PlanningContext.Provider
      value={{ planning, addEvent, removeEvent, updateEvent }}
    >
      {children}
    </PlanningContext.Provider>
  );
};

export const usePlanning = () => useContext(PlanningContext);
