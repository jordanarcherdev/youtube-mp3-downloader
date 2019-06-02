const io = require('socket.io').listen(4000).sockets;
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const readline = require('readline');
let counter = 0;

console.log('Youtuber is Running...')

//Connect Socket
io.on('connection', (socket) => {
  console.log('Socket Connected');

  //Handle input events
  socket.on('input', (data) =>  {
    video = data.videourl;

    console.log(video);
    //Get video title
    ytdl.getInfo(video, (err, info) => {
      if(err) console.log;
      let title = info.title;
      counter++;
      console.log(title);
      console.log(`Counter: ${counter}`);

      //Begin download stream
      let stream = ytdl(video, {
      quality: 'highestaudio',
      //filter: 'audioonly',
    });

    let start = Date.now();
    ffmpeg(stream)
      .audioBitrate(128)
      .save(`${__dirname}/Downloads/${title}.mp3`)
      .on('progress', (p) => {
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${title} - ${p.targetSize}kb downloaded`);
      })
      .on('end', () => {
        console.log(`\ndone, thanks - ${(Date.now() - start) / 1000}s`);
        counter--;
        console.log(`Counter: ${counter}`);
    });
    })
  })

});
