import io, { Socket } from "socket.io-client"
import { Player, PlayerJoins, PlayerLeaves, LanderRotation, PlayerUpdates, UpdatePlayersData, LanderData, LanderStatus } from "../Models/player"

const SERVER_URL = 'http://127.0.0.1:4000'
const CLIENT_NAME = 'display'
const CLIENT_UUID = '0000'
const CLIENT_EMOJI = '🤖'
let socket: Socket

let game: Phaser.Game
const players: Player[] = []

const service = {

    start: function (gameInstance: Phaser.Game) {
        game = gameInstance
        socket = io(SERVER_URL, {
            query: {
                clientName: CLIENT_NAME,
                clientUuid: CLIENT_UUID,
                clientEmoji: CLIENT_EMOJI
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

        socket.on("playerList", (data: PlayerJoins[]) => {
            console.log('Retrieving player list', data)
            data.forEach((d: PlayerJoins) => {
                const index = players.findIndex(p => p.uuid === d.uuid)
                if(index < 0) {
                    createPlayer(d.name, d.uuid, d.emoji)
                    game.events.emit('CREATE_LANDER', d)
                }
            })
        })
        
        socket.on("playerJoins", (payload: PlayerJoins) => {
            console.log('Create new player', payload.name)
            createPlayer(payload.name, payload.uuid, payload.emoji)
            game.events.emit('CREATE_LANDER', payload)
        })

        socket.on("playerLeaves", (payload: PlayerLeaves) => {
            console.log('Delete player', payload)
            deletePlayer(payload.uuid)
            game.events.emit('DESTROY_LANDER', payload)
        })

        socket.on("playerUpdates", (payload: PlayerUpdates) => {
            const playerIndex = players.findIndex(p => p.uuid === payload.uuid)
            if (playerIndex < 0) {
                // le joueur est inconnu du display, il faut le créer (possible si le display s'est déco/reco)
                createPlayer(payload.name, payload.uuid, payload.emoji)
            } else {
                players[playerIndex].actions = payload.actions
            }
            game.events.emit('UPDATE_LANDER', payload)
        })
    },

    fetchLocalIps: async function () {
        return window.fetch(SERVER_URL + '/ips');
    },

    // From the 'display'
    updatePlayersData: function (payload: UpdatePlayersData) {
        if (players.length === 0) {
            // console.log('Waiting for players to connect')
            // TODO afficher ça dans la webapp
            return
        }
        payload.landersData.forEach((d: LanderData) => {
            const playerIndex = players.findIndex(p => p.name === d.name)
            players[playerIndex].lander = { vx: d.vx, vy: d.vy, angle: d.angle, altitude: d.altitude, usedFuel: d.usedFuel, status: d.status }
        })
        socket.emit('landersData', payload.landersData)
    }
}

function createPlayer(name: string, uuid: string, emoji: string) {
    const player: Player = {
        uuid,
        name,
        emoji,
        lander: {
            vx: 0,
            vy: 0,
            angle: 0,
            altitude: 0,
            usedFuel: 0,
            status: LanderStatus.SPAWNED
        },
        actions: {
            thrust: false,
            rotate: LanderRotation.NONE
        }
    }
    players.push(player)
}

function deletePlayer(uuid: string) {
    players.splice(players.findIndex(p => p.uuid === uuid), 1)
}

export default service