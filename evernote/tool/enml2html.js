//const assert = require('assert')
const path = require('path')
const cheerio = require('cheerio');
const fs = require('fs');
const mkdirp = require('mkdirp');
//const _CONFIG = require('../../config')

module.exports = function enml2html(note, cleanMode = false) {
	let enml = note.content;
	const resources = note.resources
	//const webApiUrlPrefix = note.webApiUrlPrefix || _CONFIG.webApiUrlPrefix
	//const noteKey = note.noteKey || ''

	//assert(webApiUrlPrefix, 'webApiUrlPrefix should exist!')
	//assert(noteKey, 'noteKey should exist!')

	enml = enml.replace('<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">', '')

	let $ = cheerio.load(enml)
	$('en-note').each(function () {
		let self = $(this)
		self.css('background-color', self.attr('bgcolor'))
		self.css('color', self.attr('text'))
		self.replaceWith(`
      <div class="enNote" ${genStyle(self, ['name', 'style', 'title', 'lang', 'xml:lang', 'dir'])}>
        ${self.html()}
      </div>
    `)
	})

	$('en-media').each(function () {
		let self = $(this)
		let hash = self.attr('hash')
		let resource
		resources.forEach((item) => {
			if (item.data.bodyHash.toString('hex') === hash) {
				resource = item
			}
		})
		if (!resource) {
			self.remove()
			return
		}
		switch (resource.mime) {
			case 'image/gif':
			case 'image/jpeg':
			case 'image/png':
				self.replaceWith(`
          <img class="enMedia" \
               src="${genLocalResourceUrl(resource.guid, resource.attributes.fileName, resource.data.body)}" \
               hash="${resource.data.bodyHash.toString('hex')}" \
               alt="${resource.attributes.fileName || ''}" \
               ${genStyle(self, ['style', 'title', 'lang', 'xml:lang', 'dir'])}
          />
        `)
				break
			case 'audio/wav':
			case 'audio/mpeg':
			case 'audio/amr':
			case 'audio/x-m4a':
				self.replaceWith(`
          <audio class="enMedia" \
                 src="${genLocalResourceUrl(resource.guid, resource.attributes.fileName, resource.data.body)}" \
                 hash="${resource.data.bodyHash.toString('hex')}" \
                 ${genStyle(self, ['style', 'title', 'lang', 'xml:lang'])}>
          </audio>
        `)
				break
			default:
				self.replaceWith(`
          <iframe class="enMedia" \
                  src="${genLocalResourceUrl(resource.guid, resource.attributes.fileName, resource.data.body)}" \
                  hash="${resource.data.bodyHash.toString('hex')}" \
                  ${genStyle(self, ['style', 'title'])} \
                  frameborder="0">
          </iframe>
        `)
		}
	})

	$('en-todo').each(function () {
		let self = $(this)
		self.replaceWith(`
      <input type="checkbox" ${self[0].attribs.checked === 'true' ? 'checked' : ''}/>${self.parent().text()}
    `)
	})

	$('en-crypt').remove()

	// remove inline style
	if (cleanMode) {
		$('*').each(function () {
			$(this).removeAttr('style')
		})
	}
	// remove \n \s
	return $.html()
		.replace(/\s*\n+\s*/g, '')
		.trim()
}
function genResourceUrl(webApiUrlPrefix, noteGuid, noteKey, resourceGuid, filename) {

	return path.join(webApiUrlPrefix, `/${noteGuid}/${noteKey}/res/${resourceGuid}/${filename}`)
}
//用原笔记链接访问受限所以保存在本地
function genLocalResourceUrl(resourceGuid, filename, data) {

	try {
		const sourceName = resourceGuid + filename;
		const localSrcPath = path.resolve(__dirname, "../../public/static/note_images/");
		const localImgPath = path.resolve(localSrcPath, sourceName);
		const isExist = fs.existsSync(localImgPath);
		//把图片保存在本地;
		if (!isExist) {
			mkdirp(localSrcPath, (err) => {
				fs.writeFile(localImgPath, data, (err) => {
					if (err) console.error(err);
				});
			});
		}
		return "/static/note_images/" + sourceName;
	} catch (e) {
		console.log(e);
	}

}

function genStyle(self, names) {
	names = Array.isArray(names) ? names : [names]
	return names.map((name) => {
		return self.attr(name) ? `${name}="${self.attr(name)}"` : ''
	}).join(' ')
}
