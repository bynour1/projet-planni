import { createContext, useState } from "react";

export const ParticipantsContext = createContext({});

export const ParticipantsProvider = ({ children }) => {
  const [participants, setParticipants] = useState([
    { id: 1, nom: 'Dr. Ali', role: 'medecin' },
    { id: 2, nom: 'Technicien Sami', role: 'technicien' },
    { id: 3, nom: 'Admin', role: 'admin' },
  ]);

  const [planning, setPlanning] = useState({});

  const [currentUser, setCurrentUser] = useState(null);

  const addParticipant = (participant) =>
    setParticipants(prev => [...prev, participant]);

  const removeParticipant = (id) =>
    setParticipants(prev => prev.filter(p => p.id !== id));

  const loginUser = (user) => setCurrentUser(user);
  const logoutUser = () => setCurrentUser(null);

  const addPlanning = (day, medecin, technicien, address) => {
    setPlanning(prev => {
      const dayEvents = prev[day] || [];
      return {
        ...prev,
        [day]: [...dayEvents, { medecin, technicien, address }],
      };
    });
  };

  const autoFillPlanning = (address = 'Adresse par défaut') => {
    const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    joursSemaine.forEach(day => {
      participants.forEach(p => {
        if (p.role === 'medecin') {
          const technicien = participants.find(t => t.role === 'technicien');
          if (technicien) {
            addPlanning(day, p.nom, technicien.nom, address);
          }
        }
      });
    });
  };

  return (
    <ParticipantsContext.Provider
      value={{
        participants,
        planning,
        currentUser,
        addParticipant,
        removeParticipant,
        loginUser,
        logoutUser,
        addPlanning,
        autoFillPlanning,
      }}
    >
      {children}
    </ParticipantsContext.Provider>
  );
};
