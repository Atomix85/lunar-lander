import { randomUUID } from "crypto"
import io, { Socket } from "socket.io-client"
import { LanderData, LanderAction } from "../models/lander"

let socket: Socket
let clientUid: string
let clientName: string

const service = {

    start: function (endpoint: string, playerName: string) {
        clientName = playerName.substring(0, 12)
        clientUid = randomUUID()
        console.log('Connecting to server...')
        socket = io(endpoint, {
            query: {
                clientName: clientName,
                clientUid: clientUid
            },
        })

        socket.on("connect", () => {
            console.log('Connected to server ⚡')
        })

        socket.on("reconnect", data => {
            console.log('Reconnected to server ♻️⚡')
        })

        socket.on("disconnect", data => {
            console.log('Connection to server was lost 🔌')
        })
    },

    handleLander: function (callback: (data: LanderData) => LanderAction) {
        socket.on("landersData", payload => {
            console.log('Lander data from simulator: ', payload)
            const playerIndex = payload.findIndex((d: any) => d.name === clientName)
            const landerData = payload[playerIndex]

            // if simulator crashes and restarts, this may be undefined
            if (landerData) {
                const actions: LanderAction = callback(landerData)
                socket.emit('playerActions', actions)
            }
        })
    }
}

export default service