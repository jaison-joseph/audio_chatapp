import socketio

'''
instantiate a socketIO client
'''
sio = socketio.Client()

'''
client with debugging logs to the terminal
'''
# sio = socketio.Client(logger=True, engineio_logger=True)

'''
when a server wants to comm w a client, it emits an event
the client registers event handlers with the socketio.Client.event() or socketio.Client.on() decorators

the below method says: on the event 'my messgae' is emitted, call the handler method on_message

about that return 'OK', 123 thing: it is returned to the server's callback function 
a callback fn in the server can be used to acknowledge that the server has processed the event

'''
@sio.on('my message')
def on_message(data):
    print("I received a messgae")
    # return 'OK', 123  # tis is for the server's callbakc method

'''
what if you want a handler for all events? or a base case handler for all events, especially the ones that don't have a co-routine?
'''
@sio.on('*')
def catch_all(event, data):
    pass
'''
connecting to a host
'''
# sio.connect('http://localhost:5000')

'''
emit an event from CLIENT -> HOST
'''
# sio.emit('my message', {'foo': 'bar'})

'''
SIO spawns background tasks for incoming event handling and keeping connection alive
Main thread can do anything
'''

'''
If you want the main thread to do nothing and just chill really
'''
sio.wait()

'''
If you want the thread to do some background task
'''

# def my_background_task(my_argument):
    # do some background work here!
    # pass

# task = sio.start_background_task(my_background_task, 123)

'''
you can also get the thread to sleep
'''
# sio.sleep(2)

'''
disconeect from server
'''
# sio.disconnect()
