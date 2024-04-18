import app from "./app.js";
import cloudinary from "cloudinary";
import { Server } from "socket.io";
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Server running at port ${process.env.PORT}`);
});
//////////////////////////
const io = new Server(server, { cors: { origin: "*" } });
// const io = socket(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     credentials: true,
//   },
// });

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-noti", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("recieve-noti", data.msg);
      // console.log(onlineUsers);
    }
  });

  socket.on("send-rej", (data) => {
    // console.log("rejection noti triggered");
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("recieve-rej", data.msg);
      console.log(onlineUsers);
    }
  });
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});

//////////////////////////////////////////
