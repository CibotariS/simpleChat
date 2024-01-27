const express = require('express')
const app = express()
const mysql = require('mysql2');

//set the template engine ejs
app.set('view engine', 'ejs')

//middlewares
app.use(express.static('public'))


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
})

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database as id ' + connection.threadId);
});


//routes
app.get('/', (req, res) => {
	res.render('index')
})

//Listen on port 3000
server = app.listen(3000)



//socket.io instantiation
const io = require("socket.io")(server)


io.on('connection', (socket) => {
    console.log('New user connected');

    // Default username
    socket.username = 'Anonymous';

    // Listen on new_message
    socket.on('new_message', (data) => {
        // Broadcast the new message
        io.sockets.emit('new_message', { message: data.message, username: socket.username });

        // Insert the new message into the database
        const insertSql = 'INSERT INTO messages (userid, sendsMesages) VALUES (?, ?)';
        connection.query(insertSql, [socket.id, data.message], (err) => {
            if (err) {
                console.error('Error inserting message into database: ' + err.stack);
                return;
            }
            console.log('Message inserted into the database');
        });
    });
	//default username
	socket.username = "Anonymous"

    //listen on change_username
    socket.on('change_username', (data) => {
        socket.username = data.username
    })

    //listen on new_message
    socket.on('new_message', (data) => {
        //broadcast the new message
        io.sockets.emit('new_message', {message : data.message, username : socket.username});
    })

    //listen on typing
    socket.on('typing', (data) => {
    	socket.broadcast.emit('typing', {username : socket.username})
    })
})
