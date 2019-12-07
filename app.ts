import app from './src';

app.listen(process.env.PORT || 3000, function () {
    console.log('Lyrics server is running');
});