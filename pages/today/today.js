const lunar = require('../../utils/lunar.js');
const quotes = require('../../utils/quotes.js');

const WEEKS = ['日', '一', '二', '三', '四', '五', '六'];

// 星座区间 [结束月, 结束日, 星座名]
const ZODIAC = [
  [1, 19, '摩羯座'], [2, 18, '水瓶座'], [3, 20, '双鱼座'], [4, 19, '白羊座'],
  [5, 20, '金牛座'], [6, 21, '双子座'], [7, 22, '巨蟹座'], [8, 22, '狮子座'],
  [9, 22, '处女座'], [10, 23, '天秤座'], [11, 22, '天蝎座'], [12, 21, '射手座'],
  [12, 31, '摩羯座']
];

function getConstellation(m, d) {
  for (const [em, ed, name] of ZODIAC) {
    if (m < em || (m === em && d <= ed)) return name;
  }
  return '摩羯座';
}

Page({
  data: {
    solarDate: '',
    week: '',
    lunarText: '',
    gzText: '',
    festival: '',
    constellation: '',
    yi: '',
    ji: '',
    quote: '',
    quoteFrom: '',
    quoteIndex: 0
  },

  onShow() {
    this.renderToday();
  },

  onPullDownRefresh() {
    this.renderToday();
    wx.stopPullDownRefresh();
  },

  renderToday() {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();

    const l = lunar.solar2lunar(y, m, d);
    const festival = lunar.getFestival(y, m, d, l);

    // 当年第几天，作为默认每日一句的索引
    const dayOfYear = Math.floor((now - new Date(y, 0, 0)) / 86400000);
    const quoteIndex = dayOfYear % quotes.length;
    const q = quotes[quoteIndex];

    this.setData({
      solarDate: `${y} 年 ${m} 月 ${d} 日`,
      week: '星期' + WEEKS[now.getDay()],
      lunarText: l ? l.lunarText : '',
      gzText: l ? `${l.gzYear}年【${l.animal}年】 ${l.gzDay}日` : '',
      festival,
      constellation: getConstellation(m, d),
      yi: l ? l.yi : '',
      ji: l ? l.ji : '',
      quote: q.text,
      quoteFrom: q.from,
      quoteIndex
    });
  },

  // 换一句：随机换一条（避免与当前重复）
  shuffleQuote() {
    if (quotes.length < 2) return;
    let idx;
    do {
      idx = Math.floor(Math.random() * quotes.length);
    } while (idx === this.data.quoteIndex);
    const q = quotes[idx];
    this.setData({ quote: q.text, quoteFrom: q.from, quoteIndex: idx });
  },

  onShareAppMessage() {
    return {
      title: `${this.data.solarDate} ${this.data.lunarText} · 每日一句`,
      path: '/pages/today/today'
    };
  },

  onShareTimeline() {
    return {
      title: `${this.data.solarDate} ${this.data.lunarText}`,
      query: ''
    };
  }
});
