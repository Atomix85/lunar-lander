import { LanderData, LanderRotation } from './models/lander'
import io from './services/socket'

const SERVER_URL = process.env.SERVER_URL || 'http://127.0.0.1:4000';
const PLAYER_NAME = process.env.PLAYER_NAME || 'NO_NAME';
const PLAYER_EMOJI = process.env.PLAYER_EMOJI || '💩';
const PLAYER_COLOR = process.env.PLAYER_COLOR || 'FFFFFF';

(async () => {
    io.start(SERVER_URL, PLAYER_NAME, PLAYER_EMOJI, PLAYER_COLOR)
    io.handleLander((data: LanderData) => {
        // Ici vous faites ce que vous voulez, mais vous DEVEZ return un objet LanderAction
        const actions = {
            thrust: false,
            rotate: LanderRotation.NONE
        }

        // TODO :)

        return actions
    })
})()