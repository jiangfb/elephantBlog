## 大象博客/ElephantBlog  
[☞ 演示/Demo](https://jfb.im)

### 简介/introduction

使用Koa2基于印象笔记API,将您的笔记发布到个人博客网站.  
Using Koa2 and base on Evernote API,publish your Evernote notes to personal website as blog.

### Quick Start
```js
git clone git@github.com:jiangfb/elephantBlog.git
cd elephantBlog/config

//duplicate index.sample.js and rename to index.js
//config value
module.exports = {
	//server port
	port: 3000,
	/* if YXBJ set true,evernote set false */
	china: true,
	/*  change to false when you are ready to switch to production */
	sandbox: false,
	/* config which one notebook's content can be displayed in your blog. */
	blogNoteBookName: '大象博客',//default name
	/* 
	evernote(YXBJ) development token , 
	apply from https://app.yinxiang.com/api/DeveloperToken.action 
	如果不能自助申请可以在此人工申请 
	https://www.yinxiang.com/contact/support/ticket/
	*/
	token: 'Your evernote development token',
}

//In the evernote app, create a new notebook named as '大象博客' or you configured just now

npm i
npm start //http://localhost:3000

```

### Configuration and Customization

>* change layout or menu  
./view>components>layout.njk/menu.njk
>* change UI  
./public/static/index.scss


### 备注/Note
* 笔记内容解析是基于[enml2html.js](https://github.com/itgoyo/enml2html)修改,(./evernote/tool/enml2html)将笔记图片保存到网站静态目录防止未分享笔记图片不显示.  
* 所有数据请求都有做缓存处理,列表10分钟,笔记内容30分钟等等(./evernote/api/elephantBlogApi.js)  

* Modify enml2html.js to parse the Evernote enml,it will save note's picture to static folder to prevent encounter error when  get pictures from a unshare note.
* All the data from api response have already cached,i.e.,notes list cached 10 minutes,note content cached 30 minutes;
(./evernote/api/elephantBlogApi.js)  

