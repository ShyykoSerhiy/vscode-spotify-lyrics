import * as stringSimilarity from 'string-similarity';
import { genius } from './genius';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export interface ISong {
    artist: string,
    title: string,
    geniusPath?: string,
    /**
     * String similarity score for the song. 
     */
    similarity?: number,
    lyrics?: string
}

export type MatchedResponse = {
    matched: ISong
}

export type V2Response = {
    matched?: ISong
    songs?: ISong[]
}

export type V3SongsResponse = {
    songs?: ISong[]
}

const MIN_SIMILARITY_SCORE = 0.8;

const CLEANUP_REGEX = /\(.*\)|[\(\s\-]*[\d\s]*remastere?d?[\)\s]*.*/gmi;

export async function getLyricsV2(forSong: ISong): Promise<V2Response> {
    if (forSong.geniusPath) {
        return await getLyricsFromGenius(forSong);
    }

    const titleLc = forSong.title.toLowerCase();
    const artistLc = forSong.artist.toLowerCase();

    const artistTitle = `${forSong.artist} - ${forSong.title}`.trim();
    const cleanedUpArtistTitle = cleanUpTitle(artistTitle);

    console.log(`Trying to find lyrics for ${artistTitle}`)

    const response = await genius.search(artistTitle);
    const cleanedUpResponse = (artistTitle !== cleanedUpArtistTitle) ? await genius.search(cleanUpTitle(artistTitle)) : { hits: [] };
    const songs = Array.from((response.hits.concat(cleanedUpResponse.hits)).reduce((songsMap, hit) => {
        if (hit.type === 'song') {
            const title = hit.result.title_with_featured;
            const artist = hit.result.primary_artist.name;
            songsMap.set(hit.result.path, {
                title,
                artist,
                geniusPath: hit.result.path,
                similarity: (
                    stringSimilarity.compareTwoStrings(titleLc, title.toLowerCase()) +
                    stringSimilarity.compareTwoStrings(artistLc, artist.toLowerCase())
                ) / 2
            })
        }
        return songsMap;
    }, new Map<string, ISong>()).values()).sort((a, b) => {
        /**
         * Bigger similarity goes first
         */
        return b.similarity - a.similarity
    });

    const song = songs[0];

    if (!song || song.similarity < MIN_SIMILARITY_SCORE) {
        return {
            songs: songs
        }
    }

    return await getLyricsFromGenius(song)
}

export async function getSongsV3(forSong: ISong): Promise<V3SongsResponse> {
    const titleLc = forSong.title.toLowerCase();
    const artistLc = forSong.artist.toLowerCase();

    const artistTitle = `${forSong.artist} - ${forSong.title}`.trim();
    const cleanedUpArtistTitle = cleanUpTitle(artistTitle);

    console.log(`Trying to find lyrics for ${artistTitle}`)

    const response = await genius.search(artistTitle);
    const cleanedUpResponse = (artistTitle !== cleanedUpArtistTitle) ? await genius.search(cleanUpTitle(artistTitle)) : { hits: [] };
    const songs = Array.from((response.hits.concat(cleanedUpResponse.hits)).reduce((songsMap, hit) => {
        if (hit.type === 'song') {
            const title = hit.result.title_with_featured;
            const artist = hit.result.primary_artist.name;
            songsMap.set(hit.result.path, {
                title,
                artist,
                geniusPath: hit.result.path,
                similarity: (
                    stringSimilarity.compareTwoStrings(titleLc, title.toLowerCase()) +
                    stringSimilarity.compareTwoStrings(artistLc, artist.toLowerCase())
                ) / 2
            })
        }
        return songsMap;
    }, new Map<string, ISong>()).values()).sort((a, b) => {
        /**
         * Bigger similarity goes first
         */
        return b.similarity - a.similarity
    });

    return { songs };
}

export async function getLyricsFromGenius(song: ISong): Promise<MatchedResponse> {
    const fetchRes = await fetch(`https://genius.com${song.geniusPath}`);
    if (fetchRes.status !== 200) {
        throw {
            status: fetchRes.status,
            error: await fetchRes.text()
        };
    }
    const text = await fetchRes.text();
    const $ = cheerio.load(text);
    return {
        matched: {
            ...song,
            lyrics: $('.lyrics').text()
        }
    };
}

export function cleanUpTitle(songTitle: string) {
    return songTitle.replace(CLEANUP_REGEX, '').trim();
}