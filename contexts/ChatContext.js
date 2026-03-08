import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE } from "../constants/api";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  const getToken = async () => {
    return await AsyncStorage.getItem("userToken");
  };

  useEffect(() => {
    let socket;

    const load = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(`${API_BASE}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setMessages(data.messages || []);
      } catch (err) {
        console.error("ChatContext: erreur chargement messages:", err);
      }
    };

    load();

    // Connexion Socket.IO pour messages temps réel
    socket = io(API_BASE, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("chat:message", (newMsg) => {
      setMessages((prev) => {
        // Eviter doublons (optimistic update déjà présent)
        const exists = prev.some(
          (m) => m.id === newMsg.id ||
          (m._optimistic && m.text === newMsg.text && m.user_name === newMsg.user_name)
        );
        if (exists) {
          // Remplacer le message optimiste par la version serveur
          return prev.map((m) =>
            m._optimistic && m.text === newMsg.text && m.user_name === newMsg.user_name
              ? newMsg
              : m
          );
        }
        return [...prev, newMsg];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = async (userName, text) => {
    if (!text || !text.trim()) return;
    try {
      const token = await getToken();
      if (!token) return;

      // Mise à jour optimiste immédiate
      const optimistic = {
        id: `opt_${Date.now()}`,
        user_name: userName,
        text: text.trim(),
        created_at: new Date().toISOString(),
        _optimistic: true,
      };
      setMessages((prev) => [...prev, optimistic]);

      await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: text.trim() }),
      });
    } catch (err) {
      console.error("ChatContext: erreur envoi message:", err);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
