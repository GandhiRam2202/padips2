import { io } from "socket.io-client";

export const socket = io("https://padips2back.onrender.com", {
  transports: ["websocket"],
  autoConnect: false, // 🔴 IMPORTANT
});
