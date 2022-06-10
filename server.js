const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { Socket } = require('engine.io');
const formatMessage =require('./utils/messages');
const {userJoin,getCurrentUser,userLeave,getRoomUsers}=require('./utils/users');
const app=express();

const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname,'public')));

const botName="Chat Admin";

//run when client connect
io.on('connection', socket=>{

    socket.on('joinRoom',({username,room})=>{
       
        const user=userJoin(socket.id,username,room);
        socket.join(user.room);

           //welcome to user
    socket.emit('message',formatMessage(botName,'Welcome to ChatCord!'));
    //broadcost when a user joined
     socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the Group !`));
 
  //send user and room info
     io.to(user.room).emit('roomUsers',{
         room:user.room,
         users:getRoomUsers(user.room)
     });
    });
 

    //listen for chat message
    socket.on('chatMessage',msg=>{

        const user=getCurrentUser(socket.id);

       io.to(user.room).emit('message',formatMessage(user.username,msg));
    });


    //run when client disconnect
    socket.on('disconnect',()=> {
        const user=userLeave(socket.id);

        if(user)
        {
            io.to(user.room).emit('message',formatMessage(botName,`${user.username}
             left has the Group`));
        
             io.to(user.room).emit('roomUsers',{
                room:user.room,
                users:getRoomUsers(user.room)
            });
     
        
        }


    });
});

const PORT=3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));