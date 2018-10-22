"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const api = require("genius-api");
const node_fetch_1 = require("node-fetch");
const cheerio = require("cheerio");
const stringSimilarity = require("string-similarity");
const app = express();
const genius = new api(process.env.GENIUS_CLIENT_ACCESS_TOKEN);
app.get('/lyrics', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const title = req.query.title.toLowerCase();
            const artist = req.query.artist.toLowerCase();
            const artistTitle = `${artist} - ${title}`;
            console.log(`Trying to find lyrics for ${artistTitle}`);
            const response = yield genius.search(artistTitle);
            const song = response.hits.find((hit) => {
                if (hit.type === 'song') {
                    const titleSimilarityNumber = stringSimilarity.compareTwoStrings(title, hit.result.title_with_featured.toLowerCase());
                    return titleSimilarityNumber > 0.9 && hit.result.primary_artist.name.toLowerCase() === artist;
                }
                return false;
            });
            if (!song) {
                console.log(`Failed to find lyrics for ${artistTitle}`);
                return res.status(404).send('Not found');
            }
            const fetchRes = yield node_fetch_1.default(`https://genius.com${song.result.path}`);
            if (fetchRes.status !== 200) {
                return res.status(fetchRes.status).send(yield fetchRes.text());
            }
            const text = yield fetchRes.text();
            const $ = cheerio.load(text);
            res.status(200).send($('.lyrics').text());
        }
        catch (e) {
            return res.status(500).send(e);
        }
    });
});
app.listen(process.env.PORT || 3000, function () {
    console.log('Lyrics server is running');
});
