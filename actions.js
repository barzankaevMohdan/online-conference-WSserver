const ACTIONS = {
    JOIN: 'join',
    LEAVE: 'leave',
    ADD_PEER: 'add-peer',
    ADD_ROOM: 'add-room',
    REMOVE_PEER: 'remove-peer',
    RELAY_SDP: 'relay-sdp',
    RELAY_ICE: 'relay-ice',
    ICE_CANDIDATE: 'ice-candidate',
    SESSION_DESCRIPTION: 'session-description',
    JOIN_CHAT: 'join-chat',
    MESSAGE: 'message',
    DELETE_MESSAGE: 'delete-message',
    EDIT_SPEAKER: 'edit-speaker',
    EDIT_SPEECH: 'edit-speech',
    DELETE_SPEECH: 'delete-speech',
    DELETE_SPEAKER: 'delete-speaker',
    EDIT_STREAM: 'edit-stream',
    DELETE_ROOM: 'delete-room',
}

module.exports = ACTIONS