declare module 'genius-api' {
    type Result = {
        "highlights": any[];
        "index": string;
        "type": 'song';
        "result": {
            "annotation_count": number;
            "api_path": string;
            "full_title": string;
            "header_image_thumbnail_url": string;
            "header_image_url": string;
            "id": number;
            "lyrics_owner_id": number;
            "path": string;
            "pyongs_count": number;
            "song_art_image_thumbnail_url": string;
            "stats": {
                "hot": boolean;
                "unreviewed_annotations": number;
                [key: string]: any
            };
            "title": string;
            "url": string;
            "primary_artist": {
                "api_path": string;
                "header_image_url": string;
                "id": number;
                "image_url": string;
                "is_meme_verified": boolean;
                "is_verified": boolean;
                "name": string;
                "url": string;
            };
        };
    };

    class Genius {
        constructor(accessTocken: string);
        search(searchQuery:string): Promise<{hits: Result[]}>;
    }
    namespace Genius {
    }
    export = Genius;
}