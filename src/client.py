import socketio
import time
import asyncio

sio = socketio.AsyncClient()

async def connect():
    await sio.connect('http://localhost:5000/')
    print('my sid is', sio.sid)

async def sendMessage():
    await sio.emit('my message', {'foo': 'bar'})
    # await asyncio.sleep(4)

@sio.on("ack")
async def foo(data):
    print("ack")

async def disconnect():
    await sio.disconnect()
    print("disconnected")

async def main():
    await connect()
    await sendMessage()
    await disconnect()

asyncio.run(main())