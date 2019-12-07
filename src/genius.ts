import * as api from 'genius-api';

require('dotenv').config();

export const genius = new api(process.env.GENIUS_CLIENT_ACCESS_TOKEN);
