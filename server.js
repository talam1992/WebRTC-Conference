const socketio = require('socket.io');
const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, '')));

server = app.listen(process.env.PORT || 5000);

const io = require("socket.io")(server);

const PORT = 3000 || process.env.PORT;
console.log(`Server running on port ${PORT}`);



var connectionId;
var _userConnections = [];
//routes
//app.get('/', (req, res) => {
//    res.render('index')
//})



//console.log(`Server running on port ${PORT}`);




io.on('connection', (socket) => {


    //    console.log(user_id);

    socket.on('users_info_to_signaling_server', (data) => {
        console.log('userconnect', data.current_user_name, data.meetingid);
        var other_users = _userConnections.filter(p => p.meeting_id == data.meetingid);
        _userConnections.push({
            connectionId: socket.id,
            user_id: data.current_user_name,
            meeting_id: data.meetingid
        });
        console.log(`all users: ${_userConnections.map(a => a.connectionId)}`);
        //        console.log(_userConnections);
        console.log(`other users: ${other_users.map(a => a.connectionId)}`);
        console.log(`connection id: ${connectionId} socket id:${socket.id}`);

        other_users.forEach(v => {
            socket.to(v.connectionId).emit('newConnectionInformation', {
                other_user_id: data.current_user_name,
                connId: socket.id
            });
        });

        socket.emit('other_users_to_inform', other_users);



        //        _userConnections[0].meeting_id
    })

    socket.on('exchangeSDP', (data) => {

        socket.to(data.to_connid).emit('exchangeSDP', {
            message: data.message,
            from_connid: socket.id
        });

    }); //end of exchangeSDP
    socket.on('reset', (data) => {
        var userObj = _userConnections.find(p => p.connectionId == socket.id);
        if (userObj) {
            var meetingid = userObj.meeting_id;
            var list = _userConnections.filter(p => p.meeting_id == meetingid);
            _userConnections = _userConnections.filter(p => p.meeting_id != meetingid);

            list.forEach(v => {
                socket.to(v.connectionId).emit('reset');
            });

            socket.emit('reset');
        }

    }); //end of reset

    socket.on('disconnect', function () {
        console.log('Got disconnect!');
        var userObj = _userConnections.find(p => p.connectionId == socket.id);
        if (userObj) {
            var meetingid = userObj.meeting_id;

            _userConnections = _userConnections.filter(p => p.connectionId != socket.id);
            var list = _userConnections.filter(p => p.meeting_id == meetingid);
            console.log(`disconnected socket id   ${socket.id}`);
            console.log(`connection id: ${connectionId} socket id:${socket.id}`);
            list.forEach(v => {
                socket.to(v.connectionId).emit('informAboutConnectionEnd', socket.id);
            });
        }
    })



})
