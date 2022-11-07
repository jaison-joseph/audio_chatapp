import socketio, engineio
import uvicorn

sio = socketio.AsyncServer(async_mode='asgi')
# sio = socketio.Server(logger=True, engineio_logger=True)

app = socketio.ASGIApp(sio, static_files={
    '/': '../public/index.html',
    '/static': './public',
})

@sio.event
def connect(sid, environ, auth):
    print('New connection! | sid: {}'.format(sid))
    # print('New connection! | sid: {} | environ: {} | auth: {} : '.format(sid, environ, auth))

@sio.event
def disconnect(sid):
    print('DISCONNECT: ', sid)

@sio.on('*')
def catch_all(event, sid, data):
    print("generic handler invoked")

@sio.on('my message')
async def another_event(sid, data):
    print("my message handler invoked")
    print("from: {} | message: {}".format(sid, str(data)))
    await sio.emit("ack", {'1': '2'})

uvicorn.run(app, host='127.0.0.1', port=5000)