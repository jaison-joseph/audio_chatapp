import socketio


'''
create a Socket.IO server
'''
# sio = socketio.Server()

'''
creating a server with logging
'''
sio = socketio.Server(logger=True, engineio_logger=True)

'''
WSGI is just an interface specification by which server and application communicate.
wrap with a WSGI application
'''
app = socketio.WSGIApp(sio)


'''
creating the app with the static files config (for more on static files, read ahead)
'''
# app = socketio.WSGIApp(sio, static_files=static_files)


'''
serving static files: a dictionary is used to config
key: requested thing
value: thing to return for key

.html, .css, .js, .json, .jpg, .png, .gif and .txt are automatically given correct content type
'''
# static_files = {
#     '/': 'latency.html',
#     '/static/socket.io.js': 'static/socket.io.js',
#     '/static/style.css': 'static/style.css',
# }

'''
for explicit content type for a static file
'''
# static_files = {
#     '/': {'filename': 'latency.html', 'content_type': 'text/plain'},
# }

'''
configure entire directory w a single rule
 this means if /static/image.png is requested, the server serves /public/imge.png
'''
# static_files = {
#     '/static': './public',
# }

'''
event handlers
'''
@sio.on('my custom event')
def another_event(sid, data):
    pass
    # return 'OK', 123  # (these are agrs for the client's callback function)

'''
handler for all events, esp the ones without a handler
'''
@sio.on('*')
def catch_all(event, sid, data):
    pass

'''
this method is invoked for every new client that connects

ideal place to perform user authentication, and any necessary mapping between user entities 
in the application and the sid that was assigned to the client.

The environ argument is a dictionary in standard WSGI format containing the request information, including HTTP headers. 

The auth argument contains any authentication details passed by the client, or None if the client did not pass anything. 

After inspecting the request, the connect event handler can return False to reject the connection with the client.

Sometimes it is useful to pass data back to the client being rejected. 
In that case instead of returning False socketio.exceptions.ConnectionRefusedError can be raised, 
and all of its arguments will be sent to the client with the rejection message: raise ConnectionRefusedError('authentication failed')
'''
@sio.event
def connect(sid, environ, auth):
    print('connect: ', sid)
    # sio.save_session(sid, {'username': username}) # to save info abt this client


@sio.event
def disconnect(sid):
    # sio.get_session(sid) # to get the info saved abt this client by callin the sio.save_session method
    print('disconnect: ', sid)

'''
connect and disconnect for groups
'''

# @sio.event
# def begin_chat(sid):
#     sio.enter_room(sid, 'chat_users')

# @sio.event
# def exit_chat(sid):
#     sio.leave_room(sid, 'chat_users')

'''
emitting an event

the structure of the emit method is:
sio.emit (
    event_name      :   string,
    payload         :   str | bytes | list | dict | tuple (tuple elements have to be of the types [str | bytes | list | dict] ),
    room = None     :   sid value assigned to that client's connection with the server. 
    skip_sid = None :   sid of client to skip (for example, the sender of a message in group chat)
)

if the room arg is omitted, the event is broadcasted to all clients
'''
# sio.emit('my event', {'data': 'foobar'})

'''
emitting an event to a room
'''
# sio.emit('my event', {'data': 'foobar'}, room=user_sid)