import React, { createContext, useContext, useState } from "react";

export const PlanningContext = createContext();

export const PlanningProvider = ({ children }) => {
  // Maintenant, le planning commence vide : aucun jour fixe
  const [planning, setPlanning] = useState({});

  // Ajouter un événement
  const addEvent = (jour, medecin, technicien, adresse) => {
    setPlanning((prev) => ({
      ...prev,
      [jour]: [...(prev[jour] || []), { medecin, technicien, adresse }],
    }));
  };

  // Supprimer un événement
  const removeEvent = (jour, index) => {
    setPlanning((prev) => {
      const updatedDay = prev[jour].filter((_, i) => i !== index);
      // Si le jour devient vide, on le supprime complètement
      if (updatedDay.length === 0) {
        const { [jour]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [jour]: updatedDay };
    });
  };

  // Modifier un événement
  const updateEvent = (jour, index, newEvent) => {
    setPlanning((prev) => {
      const updatedDay = [...prev[jour]];
      updatedDay[index] = newEvent;
      return { ...prev, [jour]: updatedDay };
    });
  };

  // Ajouter un planning hebdomadaire complet
  const addWeeklyPlanning = (planningSemaine) => {
    setPlanning(planningSemaine); // remplace complètement l'ancien planning
  };

  return (
    <PlanningContext.Provider
      value={{ planning, addEvent, removeEvent, updateEvent, addWeeklyPlanning }}
    >
      {children}
    </PlanningContext.Provider>
  );
};

export const usePlanning = () => useContext(PlanningContext);
