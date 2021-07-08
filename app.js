require('dotenv').config()

const path = require('path');
const http = require('http');

const express = require('express');
const socketio = require('socket.io');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const PORT = process.env.PORT || 3000

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = process.env.DATABASE;

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();

const server = http.createServer(app);
const io = socketio(server);
const formatMessage = require('./util/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./util/users');


app.set('view engine', 'ejs');
app.set('views', 'views');

const authRoutes = require('./routes/auth');

const chatRoutes = require('./routes/chat');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if(!user){
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      throw new Error(err);
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});


app.use(authRoutes);
app.use(chatRoutes);

app.use(errorController.get404);

//run when client conncets
io.on('connection', socket => {

    

    // specify room
    socket.on('joinRoom', ({username, room}) => {

        const user = userJoin(socket.id, username, room);

        socket
        .join(user.room)
        ;

        socket
        .emit('message', formatMessage('Admin','Welcome to the chat'));
        // broadcast when user connects
    
        socket
        .broadcast
        .to(user.room)
        .emit('message',
         formatMessage('Admin',`${user.username} joined the chat !`)
         );

         io.to(user.room).emit('roomUsers', {
             room:user.room,
             users: getRoomUsers(user.room)
         });
    });

// listen for chatMessage

socket.on('chatMessage', (msg) => {

    const user = getCurrentUser(socket.id);

  io.to(user.room).emit('message', formatMessage(user.username, msg));
})

        // run when client disconnceets
    
        socket.on('disconnect', () => {
            const user = userLeave(socket.id);
            if(user){
            io.to(user.room).emit('message', formatMessage('Admin',`${user.username} left the chat`))
            }
        
        })

})

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
  })
  .catch(err => {
    console.log(err);
  });
