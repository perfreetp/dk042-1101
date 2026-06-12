export default defineAppConfig({
  pages: [
    'pages/plaza/index',
    'pages/publish/index',
    'pages/messages/index',
    'pages/mine/index',
    'pages/detail/index',
    'pages/report/index',
    'pages/blockwords/index',
    'pages/blacklist/index',
    'pages/privacy/index',
    'pages/helpline/index',
    'pages/drafts/index',
    'pages/history/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#7C5CFF',
    navigationBarTitleText: '匿名树洞',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FAF8FF'
  },
  tabBar: {
    color: '#9CA3AF',
    selectedColor: '#7C5CFF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/plaza/index',
        text: '广场'
      },
      {
        pagePath: 'pages/publish/index',
        text: '发布'
      },
      {
        pagePath: 'pages/messages/index',
        text: '消息'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
