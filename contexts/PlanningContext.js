// contexts/PlanningContext.js
import React, { createContext, useContext, useMemo, useState } from "react";

export const PlanningContext = createContext(null);

export const PlanningProvider = ({ children }) => {
  // planning = { Lundi: [{ medecin, technicien, address }], ... }
  const [planning, setPlanning] = useState({});

  const addPlanning = (day, medecin, technicien, address) => {
    setPlanning(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), { medecin, technicien, address }],
    }));
  };

  // (optionnel) pour tester l'affichage : des données par défaut
  // useEffect(() => {
  //   addPlanning("Lundi", "Dr. Ali", "Tech Sami", "Rue 1");
  //   addPlanning("Mardi", "Dr. Amal", "Tech Hatem", "Rue 2");
  // }, []);

  const value = useMemo(() => ({ planning, addPlanning }), [planning]);

  return (
    <PlanningContext.Provider value={value}>
      {children}
    </PlanningContext.Provider>
  );
};

export const usePlanning = () => {
  const ctx = useContext(PlanningContext);
  if (!ctx) {
    throw new Error("usePlanning doit être utilisé à l’intérieur d’un PlanningProvider");
  }
  return ctx;
};
