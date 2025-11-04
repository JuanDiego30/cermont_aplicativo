import { io } from 'socket.io-client';
let socket = null;
export function getSocket() {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_API_URL, {
            path: '/socket.io',
            transports: ['websocket'],
            secure: process.env.NEXT_PUBLIC_API_URL?.startsWith('https'),
        });
    }
    return socket;
}
//# sourceMappingURL=index.js.map