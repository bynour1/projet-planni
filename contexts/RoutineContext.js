import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const RoutineContext = createContext();

export const RoutineProvider = ({ children }) => {
  const [routines, setRoutines] = useState([]);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const routinesData = await AsyncStorage.getItem("@routines");
      const schedulesData = await AsyncStorage.getItem("@schedules");
      
      if (routinesData) setRoutines(JSON.parse(routinesData));
      if (schedulesData) setSchedules(JSON.parse(schedulesData));
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const saveRoutines = async (newRoutines) => {
    try {
      await AsyncStorage.setItem("@routines", JSON.stringify(newRoutines));
      setRoutines(newRoutines);
    } catch (error) {
      console.error("Error saving routines:", error);
    }
  };

  const saveSchedules = async (newSchedules) => {
    try {
      await AsyncStorage.setItem("@schedules", JSON.stringify(newSchedules));
      setSchedules(newSchedules);
    } catch (error) {
      console.error("Error saving schedules:", error);
    }
  };

  // Ajouter une routine
  const addRoutine = async (routine) => {
    const newRoutine = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...routine,
    };
    const newRoutines = [...routines, newRoutine];
    await saveRoutines(newRoutines);
    return newRoutine;
  };

  // Modifier une routine
  const updateRoutine = async (id, updatedData) => {
    const newRoutines = routines.map((routine) =>
      routine.id === id ? { ...routine, ...updatedData } : routine
    );
    await saveRoutines(newRoutines);
  };

  // Supprimer une routine
  const deleteRoutine = async (id) => {
    const newRoutines = routines.filter((routine) => routine.id !== id);
    await saveRoutines(newRoutines);
  };

  // Ajouter un horaire
  const addSchedule = async (schedule) => {
    const newSchedule = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...schedule,
    };
    const newSchedules = [...schedules, newSchedule];
    await saveSchedules(newSchedules);
    return newSchedule;
  };

  // Modifier un horaire
  const updateSchedule = async (id, updatedData) => {
    const newSchedules = schedules.map((schedule) =>
      schedule.id === id ? { ...schedule, ...updatedData } : schedule
    );
    await saveSchedules(newSchedules);
  };

  // Supprimer un horaire
  const deleteSchedule = async (id) => {
    const newSchedules = schedules.filter((schedule) => schedule.id !== id);
    await saveSchedules(newSchedules);
  };

  // Obtenir les routines pour une date
  const getRoutinesForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return routines.filter((routine) => {
      if (routine.startDate && routine.endDate) {
        const startDate = new Date(routine.startDate).toISOString().split("T")[0];
        const endDate = new Date(routine.endDate).toISOString().split("T")[0];
        return dateStr >= startDate && dateStr <= endDate;
      }
      return false;
    });
  };

  // Obtenir les horaires pour une date
  const getSchedulesForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return schedules.filter((schedule) => {
      if (schedule.date) {
        const scheduleDate = new Date(schedule.date).toISOString().split("T")[0];
        return scheduleDate === dateStr;
      }
      return false;
    });
  };

  return (
    <RoutineContext.Provider
      value={{
        routines,
        schedules,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        getRoutinesForDate,
        getSchedulesForDate,
      }}
    >
      {children}
    </RoutineContext.Provider>
  );
};

export const useRoutines = () => {
  const context = useContext(RoutineContext);
  if (!context) {
    throw new Error("useRoutines must be used within a RoutineProvider");
  }
  return context;
};
