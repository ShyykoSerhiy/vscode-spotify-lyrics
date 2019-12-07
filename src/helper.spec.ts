import { equal, deepEqual, notEqual } from 'assert';
import { getLyricsFromGenius, getLyricsV2, ISong, cleanUpTitle } from './helper';

describe('getLyricsV2', () => {
    it('should return lyrics for proper song', async () => {
        const song: ISong = {
            artist: 'Jimmy Eat World',
            title: 'Delivery',
        };
        const response = await getLyricsV2(song);
        notEqual(response.matched, undefined);
    });

    it('should return lyrics sugestion list for not recognized songs', async () => {
        const song: ISong = {
            artist: 'Jet',
            title: 'Look What You\'ve Done',
        };
        const response = await getLyricsV2(song);
        equal(response.matched, undefined);
        notEqual(response.songs, undefined);
        equal(response.songs[0].artist, 'Jet (band)');
        equal(response.songs[0].title, song.title);
    });

    it('should return lyrics sugestion list for not recognized songs 2', async () => {
        const song: ISong = {
            artist: 'Final Space',
            title: 'When the Night Is Long (From "Final Space")',
        };
        const response = await getLyricsV2(song);
        equal(response.matched, undefined);
        notEqual(response.songs, undefined);
        equal(response.songs[0].artist, 'Final Space');
        equal(response.songs[0].title, 'When The Night Is Long (Ft. Shelby Merry)');
    });

    it('should return lyrics by genius path if it\' is present', async () => {
        const song: ISong = {
            artist: 'Final Space',
            title: 'When the Night Is Long (From "Final Space")',
            /**
             * note that this path is deliberately wrong
             */
            geniusPath: '/Jet-band-look-what-youve-done-lyrics'
        };

        const response = await getLyricsV2(song);

        equal(response.matched.lyrics.indexOf('Take my photo off the wall') > 0, true);
    });
});

describe('cleanUpTitle', () => {
    it('should clean Final Space - When the Night Is Long (From "Final Space")', () => {
        equal(cleanUpTitle('Final Space - When the Night Is Long (From "Final Space")'), 'Final Space - When the Night Is Long')
    });
    it('should clean The Notorious B.I.G. - Hypnotize - 2014 Remastered Version', () => {
        equal(cleanUpTitle('The Notorious B.I.G. - Hypnotize - 2014 Remastered Version'), 'The Notorious B.I.G. - Hypnotize')
    });
});
