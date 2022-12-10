import socketio
import time

sio = socketio.Client()

@sio.event
def connect():
    print('my sid is', sio.sid)
    sio.emit('my message', {'foo': 'bar'})

@sio.on("ack")
def foo(data):
    print("ack", str(data))

@sio.on('*')
def catch_all(event, data):
    print("event: {} | data: {]".format(event, str(data)))

# just so that we can manually quit the client by typing in quit
def quitter():
    while True:
        x = input()
        if x == 'quit':
            break
    sio.disconnect()

sio.connect("http://localhost:5000")
task = sio.start_background_task(quitter)
print("to stop the application, enter 'quit' into the terminal")