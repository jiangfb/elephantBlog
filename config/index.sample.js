module.exports = {
	//server port
	port: 3000,
	/* if YXBJ set true,evernote set false */
	china: true,
	/*  change to false when you are ready to switch to production */
	sandbox: false,
	/* config which one notebook can be displayed in your blog. */
	blogNoteBookName: '大象博客',//default name
	/* 
	evernote(YXBJ) development token , 
	apply from https://app.yinxiang.com/api/DeveloperToken.action 
	如果不能自助申请可以在此人工申请 
	https://www.yinxiang.com/contact/support/ticket/
	*/
	token: 'Your evernote development token',
}
