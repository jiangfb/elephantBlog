/* 
	Evernote API https://dev.yinxiang.com/doc/reference/NoteStore.html
*/

const Evernote = require('evernote');
const noteStore = require('./noteStore');
const enml2html = require('../tool/enml2html');
const moment = require('moment');

//get the note content
exports.getNote = async (ctx) => {

	const { noteGuid } = ctx.params;
	if (!noteGuid) throw (new Error('No note id'));
	let res = '';

	try {
		const cacheData = ctx.nodeCache.get(noteGuid);

		if (cacheData) {
			console.log('Note from nodeCache', noteGuid);
			return cacheData
		}
		const note = await noteStore.getNote(noteGuid, true, true, true, true);

		if (note && note.guid) {
			content = enml2html(note);
			const tags = await exports.listTagsByNotebook(ctx);
			res = {
				title: note.title,
				created: moment(note.created).format('YYYY年M月D日'),
				tagNames: note.tagGuids && note.tagGuids.map(tagGuid => tags.map[tagGuid]) || [],
				tags,
				content,
			}
			ctx.nodeCache.set(noteGuid, res, 1800);//cache data 30 minutes;
		}
	} catch (e) {
		console.error(e);
		throw (new Error('Get note content error'))
	}
	return res;
}

//get notes list
exports.findNotesMetadata = async (ctx) => {

	const { blogBookGuid } = ctx.auth;
	if (!blogBookGuid) {
		throw (new Error('No note id'));
	}

	const maxNotes = 10;
	const { pageIndex = 1 } = ctx.params;
	const { tag = 'all' } = ctx.query;

	const offset = (pageIndex - 1) * maxNotes;//start 0

	//get data from cache if exist;
	const cacheKey = `${blogBookGuid}_${tag}_${pageIndex}`;
	const cacheValue = ctx.nodeCache.get(cacheKey);

	if (cacheValue) {
		console.log('Note list from nodeCache', cacheKey);
		return cacheValue;
	}

	var filter = new Evernote.NoteStore.NoteFilter({
		order: 1,
		tagGuids: tag !== 'all' ? [tag] : [],
		notebookGuid: blogBookGuid,
		ascending: false
	});

	var spec = new Evernote.NoteStore.NotesMetadataResultSpec({
		includeTitle: true,
		includeCreated: true,
		includeTagGuids: true,
		includeAttributes: true
	});

	try {

		const [notesMetadata, tags] = await Promise.all(
			[
				noteStore.findNotesMetadata(filter, offset, maxNotes, spec),
				exports.listTagsByNotebook(ctx)
			]);

		if (notesMetadata && notesMetadata.notes) {
			notesMetadata.tags = tags;

			const getNoteContent = notesMetadata.notes.map(note => {

				note.created = moment(note.created).format('YYYY年M月D日');
				note.tagNames = note.tagGuids && note.tagGuids.map(tagGuid => tags.map && tags.map[tagGuid]) || [];
				return noteStore.getNote(note.guid, true, true, false, false);
			})

			//get the content to preview
			const notesContent = await Promise.all(getNoteContent);
			notesContent.forEach((note, index) => {
				note.content = note.content.slice(0, 3000);
				const previewContent = enml2html(note);
				notesMetadata.notes[index].previewContent = previewContent;
			});

			ctx.nodeCache.set(cacheKey, notesMetadata, 600);//cache 10 minutes

			return notesMetadata;

		} else { return {} };

	} catch (e) {
		console.error(e);
		throw (new Error('Get note list error'));
	}
}
//get tags 
exports.listTagsByNotebook = async (ctx) => {

	try {
		const { blogBookGuid } = ctx.auth;
		const { tag = '' } = ctx.query;//current tag;

		const cacheKey = `${blogBookGuid}_tags`;
		const cacheValue = ctx.nodeCache.get(cacheKey);

		if (cacheValue) {
			console.log('tags list from nodeCache', cacheKey);
			cacheValue.currentGuid = tag;
			return cacheValue;
		}
		let list = await noteStore.listTagsByNotebook(blogBookGuid);

		let map = {};
		if (list) {
			list.forEach(tag => {
				map[tag.guid] = tag.name;
			})
		}
		const res = { list, map, currentGuid: tag };
		ctx.nodeCache.set(cacheKey, res, 3600);//cached tags data 1 hour;
		return res;
	} catch (e) {
		console.error(e);
		return {};
	}


}