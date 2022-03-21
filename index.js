const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const ACTIONS = require('./actions')
const PORT = process.env.PORT || 3001

io.on('connection', (socket) => {
    socket.on(ACTIONS.JOIN, config => {
        const {roomID, streamID} = config
        const {rooms: joinedRooms} = socket

        if (Array.from(joinedRooms).includes(roomID)) {
            return console.warn(`Already joined to ${roomID}`)
        }

        const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || [])

        socket.broadcast.emit(ACTIONS.ADD_ROOM, {
            roomID,
            streamID
        })

        clients.forEach(clientID => {
            io.to(clientID).emit(ACTIONS.ADD_PEER, {
                peerID: socket.id,
                createOffer: false,
            })

            socket.emit(ACTIONS.ADD_PEER, {
                peerID: clientID,
                createOffer: true,
            })
        })

        socket.join(roomID)
    })

    function leaveRoom() {
        const {rooms} = socket

        Array.from(rooms)
            .forEach(roomID => {
                const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);

                socket.broadcast.emit(ACTIONS.LEAVE, {
                    roomID,
                })

                clients
                    .forEach(clientID => {
                        io.to(clientID).emit(ACTIONS.REMOVE_PEER, {
                            peerID: socket.id,
                        })

                        socket.emit(ACTIONS.REMOVE_PEER, {
                            peerID: clientID,
                        })
                    })

                socket.leave(roomID)
            })
    }

    socket.on(ACTIONS.LEAVE, leaveRoom)

    socket.on('disconnecting', leaveRoom);

    socket.on(ACTIONS.RELAY_SDP, ({peerID, sessionDescription}) => {
        io.to(peerID).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerID: socket.id,
            sessionDescription,
        })
    })

    socket.on(ACTIONS.RELAY_ICE, ({peerID, iceCandidate}) => {
        io.to(peerID).emit(ACTIONS.ICE_CANDIDATE, {
            peerID: socket.id,
            iceCandidate,
        })
    })

    socket.on('join-chat', (roomID) => {
        socket.join(roomID)
    })

    socket.on('message', (data) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(data.id) || [])
        clients.forEach(clientID => {
            io.to(clientID).emit('message', {
                ...data
            })
        })
    })
})

server.listen(PORT, () => {
    console.log('listening on *:3000');
})