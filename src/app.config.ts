export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/medicines/index',
    'pages/family/index',
    'pages/mine/index',
    'pages/reminder-detail/index',
    'pages/medicine-edit/index',
    'pages/bind-elder/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2F7A68',
    navigationBarTitleText: '安心药提醒',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#8A8A8A',
    selectedColor: '#2F7A68',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/medicines/index',
        text: '我的药'
      },
      {
        pagePath: 'pages/family/index',
        text: '家人关怀'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
