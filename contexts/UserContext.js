import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('userInfo');
        const t = await AsyncStorage.getItem('userToken');
        if (raw) setUser(JSON.parse(raw));
        if (t) setToken(t);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const saveUser = async (u, t) => {
    try {
      if (u) await AsyncStorage.setItem('userInfo', JSON.stringify(u));
      else await AsyncStorage.removeItem('userInfo');
      if (t) await AsyncStorage.setItem('userToken', t); else await AsyncStorage.removeItem('userToken');
    } catch (e) {
      // ignore
    }
    setUser(u);
    setToken(t || null);
  };

  const logout = async () => {
    await saveUser(null, null);
  };

  return (
    <UserContext.Provider value={{ user, token, setUser: saveUser, rawSetUser: setUser, rawSetToken: setToken, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
