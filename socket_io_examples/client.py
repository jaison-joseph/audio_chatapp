import socketio

sio  = socketio.Client()

@sio.event()
def connect():
    print("connected")

@sio.event()
def disconnect():
    print("disconnected")

@sio.event
def my_message(data):
    print('message received with ', data)
    sio.emit('my response', {'response': 'my response'})

sio.connect('http://localhost:5000', wait_timeout = 10)
# sio.connect('http://localhost:5000')
# sio.wait()
sio.disconnect()