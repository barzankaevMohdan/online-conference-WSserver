const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const ACTIONS = require('./actions')
const PORT = process.env.PORT || 3001

io.on('connection', (socket) => {
    socket.on(ACTIONS.JOIN, id => {
        const {rooms: joinedRooms} = socket

        if (Array.from(joinedRooms).includes(id)) {
            return console.warn(`Already joined to ${id}`)
        }

        const clients = Array.from(io.sockets.adapter.rooms.get(id) || [])

        clients.forEach(clientId => {
            io.to(clientId).emit(ACTIONS.ADD_PEER, {
                peerId: socket.id,
                createOffer: false,
            })

            socket.emit(ACTIONS.ADD_PEER, {
                peerId: clientId,
                createOffer: true,
            })
        })

        socket.join(id)
    })

    socket.on(ACTIONS.DELETE_ROOM, (roomId) => {
        const clients = Array.from(io.sockets.adapter.rooms)
        clients.forEach(clientId => {
            io.to(clientId).emit(ACTIONS.DELETE_ROOM, roomId)
        })
    })

    socket.on(ACTIONS.ADD_ROOM, (room) => {
        const clients = Array.from(io.sockets.adapter.rooms)
        clients.forEach(clientId => {
            io.to(clientId).emit(ACTIONS.ADD_ROOM, room)
        })
    })

    socket.on(ACTIONS.LEAVE, leaveRoom)

    socket.on('disconnecting', leaveRoom);

    socket.on(ACTIONS.RELAY_SDP, ({peerId, sessionDescription}) => {
        io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerId: socket.id,
            sessionDescription,
        })
    })

    socket.on(ACTIONS.RELAY_ICE, ({peerId, iceCandidate}) => {
        io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
            peerId: socket.id,
            iceCandidate,
        })
    })

    socket.on(ACTIONS.JOIN_CHAT, (roomId) => {
        socket.join(roomId)
    })

    socket.on(ACTIONS.MESSAGE, (data) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(data.streamId) || [])
        clients.forEach(clientId => {
            io.to(clientId).emit('message', {
                ...data
            })
        })
    })

    socket.on(ACTIONS.DELETE_MESSAGE, (data) => {
        const clients = Array.from(io.sockets.adapter.rooms)
        clients.forEach(clientId => {
            io.to(clientId).emit(ACTIONS.DELETE_MESSAGE, data)
        })
    })

    socket.on(ACTIONS.EDIT_SPEECH, (data) => {
        const clients = Array.from(io.sockets.adapter.rooms)
        clients.forEach(clientId => {
            io.to(clientId).emit(ACTIONS.EDIT_SPEECH, data)
        })
    })

    socket.on(ACTIONS.EDIT_SPEAKER, (data) => {
        const clients = Array.from(io.sockets.adapter.rooms)
        clients.forEach(clientId => {
            io.to(clientId).emit(ACTIONS.EDIT_SPEAKER, data)
        })
    })

    socket.on(ACTIONS.DELETE_SPEECH, (data) => {
        const clients = Array.from(io.sockets.adapter.rooms)
        clients.forEach(clientId => {
            io.to(clientId).emit(ACTIONS.DELETE_SPEECH, data)
        })
    })

    socket.on(ACTIONS.DELETE_SPEAKER, (data) => {
        const clients = Array.from(io.sockets.adapter.rooms)
        clients.forEach(clientId => {
            io.to(clientId).emit(ACTIONS.DELETE_SPEAKER, data)
        })
    })

    socket.on(ACTIONS.EDIT_STREAM, (data) => {
        const clients = Array.from(io.sockets.adapter.rooms)
        clients.forEach(clientId => {
            io.to(clientId).emit(ACTIONS.EDIT_STREAM, data)
        })
    })

    function leaveRoom() {
        const {rooms} = socket

        Array.from(rooms)
            .forEach(roomId => {
                const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

                clients
                    .forEach(clientId => {
                        io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
                            peerId: socket.id,
                        })

                        socket.emit(ACTIONS.REMOVE_PEER, {
                            peerId: clientId,
                        })
                    })

                socket.leave(roomId)
            })
    }
})

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
})