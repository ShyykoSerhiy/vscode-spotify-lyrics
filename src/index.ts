import * as express from 'express';
import * as api from 'genius-api';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import * as stringSimilarity from 'string-similarity';
import { getLyricsV2 } from './helper';

const app = express();
const genius = new api(process.env.GENIUS_CLIENT_ACCESS_TOKEN);

app.get('/v2/lyrics', async function (req, res) {    
    try {
        const title = req.query.title;
        const artist = req.query.artist;
        const geniusPath = req.query.geniusPath;

        const response = await getLyricsV2({
            artist,
            title,
            geniusPath
        });

        res.status(200).send(response);
    } catch (e) {
        let err = e || {};
        return res.status(err.status || 500).send(err.error || err);
    }
})

app.get('/lyrics', async function (req, res) {    
    try {
        const title = req.query.title.toLowerCase();
        const artist = req.query.artist.toLowerCase();
        const artistTitle = `${artist} - ${title}`;

        console.log(`Trying to find lyrics for ${artistTitle}`)

        const response = await genius.search(artistTitle);
        const song = response.hits.find((hit) => {
            if (hit.type === 'song') {
                const titleSimilarityNumber = stringSimilarity.compareTwoStrings(title, hit.result.title_with_featured.toLowerCase());
                const artistSimilarityNumber = stringSimilarity.compareTwoStrings(artist, hit.result.primary_artist.name.toLowerCase());
                return titleSimilarityNumber > 0.9 && artistSimilarityNumber > 0.9;
            }
            return false;
        })
        if (!song) {
            console.log(`Failed to find lyrics for ${artistTitle}`)
            return res.status(404).send('Not found');
        }
        const fetchRes = await fetch(`https://genius.com${song.result.path}`);
        if (fetchRes.status !== 200) {
            return res.status(fetchRes.status).send(await fetchRes.text());
        }
        const text = await fetchRes.text();
        const $ = cheerio.load(text);
        res.status(200).send($('.lyrics').text());
    } catch (e) {        
        return res.status(500).send(e);
    }
})

export default app;