const net = require('net');
const http = require('http');

let emails = [];

const smtp = net.createServer(socket => {
  let inData = false;
  let currentEmail = '';

  socket.write('220 localhost ESMTP\r\n');
  socket.on('data', d => {
    const text = d.toString();
    const cmd = text.toUpperCase();

    if (inData) {
      currentEmail += text;
      if (currentEmail.includes('\r\n.\r\n')) {
        inData = false;
        emails.push(currentEmail);
        currentEmail = '';
        socket.write('250 OK\r\n');
      }
    } else {
      if(cmd.startsWith('EHLO') || cmd.startsWith('HELO')) { socket.write('250 localhost Hello\r\n'); }
      else if(cmd.startsWith('AUTH')) { socket.write('235 Authentication successful\r\n'); }
      else if(cmd.startsWith('MAIL FROM')) { socket.write('250 OK\r\n'); }
      else if(cmd.startsWith('RCPT TO')) { socket.write('250 OK\r\n'); }
      else if(cmd.startsWith('DATA')) { 
        inData = true;
        currentEmail = '';
        socket.write('354 End data with <CR><LF>.<CR><LF>\r\n'); 
      }
      else if(cmd.startsWith('QUIT')) { socket.write('221 Bye\r\n'); socket.end(); }
      else { socket.write('250 OK\r\n'); }
    }
  });
});
smtp.listen(1025, () => console.log('SMTP listening on 1025'));

const api = http.createServer((req, res) => {
  if (req.url === '/emails' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(emails));
  } else if (req.url === '/emails' && req.method === 'DELETE') {
    emails = [];
    res.writeHead(204);
    res.end();
  } else {
    res.writeHead(404);
    res.end();
  }
});
api.listen(1080, () => console.log('HTTP API listening on 1080'));
