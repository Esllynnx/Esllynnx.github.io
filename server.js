const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Rota inicial para servir a página HTML do chat
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Array para armazenar usuários conectados
const users = {};

// Evento de conexão do socket
io.on('connection', socket => {
  console.log('Usuário conectado:', socket.id);

  // Evento para adicionar novo usuário
  socket.on('addUser', username => {
    users[socket.id] = username;
    io.emit('userJoined', `${username} entrou no chat.`);
    io.emit('updateUsersList', Object.values(users));
  });

  // Evento de envio de mensagem
  socket.on('sendMessage', message => {
    io.emit('receiveMessage', {
      user: users[socket.id],
      message: message
    });
  });

  // Evento de desconexão do usuário
  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
    io.emit('userLeft', `${users[socket.id]} saiu do chat.`);
    delete users[socket.id];
    io.emit('updateUsersList', Object.values(users));
  });
});

// Inicia o servidor na porta 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
