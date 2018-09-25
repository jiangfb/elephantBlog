const Evernote = require('evernote');
const { sandbox, china } = require("../../config");
const _TOKEN = process.env.TOKEN || require("../../config").token;

const authenticatedClient = new Evernote.Client({
	token: _TOKEN,
	sandbox,
	china
});
const noteStore = authenticatedClient.getNoteStore();

console.log('elephant blog init completed');

module.exports = noteStore;