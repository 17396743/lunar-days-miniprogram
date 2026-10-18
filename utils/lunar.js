/**
 * 精简版农历黄历算法库（1900-2100）
 * 纯本地计算：农历日期、干支、生肖、宜忌
 */

// 农历数据表 1900-2100（每年一个十六进制数，bit 编码大小月与闰月）
const lunarInfo = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, // 1900-1909
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, // 1910-1919
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, // 1920-1929
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, // 1930-1939
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, // 1940-1949
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, // 1950-1959
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, // 1960-1969
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, // 1970-1979
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, // 1980-1989
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0, // 1990-1999
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, // 2000-2009
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, // 2010-2019
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, // 2020-2029
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, // 2030-2039
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, // 2040-2049
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0, // 2050-2059
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, // 2060-2069
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, // 2070-2079
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, // 2080-2089
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252, // 2090-2099
  0x0d520 // 2100
];

const Gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const Zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const Animals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
const monthCn = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
const dayCn1 = ['初', '十', '廿', '卅'];
const dayCn2 = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

// 宜忌词库（按日干支轮换的传统简化算法，仅供娱乐参考）
const yiPool = ['祭祀', '祈福', '出行', '会友', '开市', '纳财', '安床', '栽种', '扫舍', '沐浴', '理发', '签约', '搬家', '入学', '动土', '嫁娶', '求医', '立券', '装修', '旅游'];
const jiPool = ['诉讼', '远行', '破土', '嫁娶', '开仓', '借贷', '争吵', '熬夜', '冲动消费', '探病', '伐木', '词讼', '置产', '跳槽', '大额投资', '久坐', '贪杯', '动怒', '拖延', '空腹饮冷'];

function lYearDays(y) {
  let sum = 348;
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += (lunarInfo[y - 1900] & i) ? 1 : 0;
  }
  return sum + leapDays(y);
}

function leapMonth(y) {
  return lunarInfo[y - 1900] & 0xf;
}

function leapDays(y) {
  if (leapMonth(y)) {
    return (lunarInfo[y - 1900] & 0x10000) ? 30 : 29;
  }
  return 0;
}

function monthDays(y, m) {
  return (lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29;
}

function cyclical(num) {
  return Gan[num % 10] + Zhi[num % 12];
}

// ================= 二十四节气 =================
const termNames = ['小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'];
const sTermInfo = [0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758];

// 某年第 n 个节气的日期（日），n: 0-23
function termDay(y, n) {
  const offDate = new Date(31556925974.7 * (y - 1900) + sTermInfo[n] * 60000 + Date.UTC(1900, 0, 6, 2, 5));
  return offDate.getUTCDate();
}

// 返回当日节气名，无则返回 ''
function getSolarTerm(y, m, d) {
  const t1 = termDay(y, (m - 1) * 2);
  const t2 = termDay(y, (m - 1) * 2 + 1);
  if (d === t1) return termNames[(m - 1) * 2];
  if (d === t2) return termNames[(m - 1) * 2 + 1];
  return '';
}

// ================= 节日 =================
const solarFestival = {
  '1-1': '元旦', '2-14': '情人节', '3-8': '妇女节', '3-12': '植树节',
  '4-1': '愚人节', '5-1': '劳动节', '5-4': '青年节', '6-1': '儿童节',
  '7-1': '建党节', '8-1': '建军节', '9-10': '教师节', '10-1': '国庆节',
  '12-24': '平安夜', '12-25': '圣诞节'
};
const lunarFestival = {
  '1-1': '春节', '1-15': '元宵节', '5-5': '端午节', '7-7': '七夕',
  '8-15': '中秋节', '9-9': '重阳节', '12-8': '腊八节', '12-23': '小年'
};

// 综合返回当日节日/节气（优先级：农历节 > 公历节 > 节气）
function getFestival(y, m, d, lunarObj) {
  if (lunarObj && !lunarObj.isLeap) {
    // 除夕：农历年最后一天
    if (lunarObj.lMonth === 12 && lunarObj.lDay === monthDays(lunarObj.lYear, 12)) {
      return '除夕';
    }
    const lf = lunarFestival[lunarObj.lMonth + '-' + lunarObj.lDay];
    if (lf) return lf;
  }
  const sf = solarFestival[m + '-' + d];
  if (sf) return sf;
  return getSolarTerm(y, m, d);
}

function getDayCn(day) {
  if (day === 10) return '初十';
  if (day === 20) return '二十';
  if (day === 30) return '三十';
  return dayCn1[Math.floor(day / 10)] + dayCn2[(day % 10) - 1];
}

/**
 * 公历转农历
 * @returns {{lYear,lMonth,lDay,isLeap,lunarText,gzYear,animal,gzDay,yi,ji}}
 */
function solar2lunar(y, m, d) {
  if (y < 1900 || y > 2100) return null;

  let offset = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 31)) / 86400000);

  let i, temp = 0;
  for (i = 1900; i < 2101 && offset > 0; i++) {
    temp = lYearDays(i);
    offset -= temp;
  }
  if (offset < 0) {
    offset += temp;
    i--;
  }

  const lYear = i;
  const leap = leapMonth(i);
  let isLeap = false;

  for (i = 1; i < 13 && offset > 0; i++) {
    if (leap > 0 && i === leap + 1 && !isLeap) {
      --i;
      isLeap = true;
      temp = leapDays(lYear);
    } else {
      temp = monthDays(lYear, i);
    }
    if (isLeap && i === leap + 1) isLeap = false;
    offset -= temp;
  }

  if (offset === 0 && leap > 0 && i === leap + 1) {
    if (isLeap) {
      isLeap = false;
    } else {
      isLeap = true;
      --i;
    }
  }
  if (offset < 0) {
    offset += temp;
    --i;
  }

  const lMonth = i;
  const lDay = offset + 1;

  const monthText = (isLeap ? '闰' : '') + monthCn[lMonth - 1] + '月';
  const dayText = getDayCn(lDay);

  // 干支：年按立春近似简化（此处按农历年），日柱按经典公式
  const gzYear = cyclical(lYear - 1900 + 36);
  const animal = Animals[(lYear - 4) % 12];
  const dayCyclical = Date.UTC(y, m - 1, 1) / 86400000 + 25567 + 10;
  const gzDay = cyclical(dayCyclical + d - 1);

  // 宜忌：按日柱序号轮换选取
  const seed = (dayCyclical + d - 1) % 60;
  const yi = [];
  const ji = [];
  for (let k = 0; k < 4; k++) {
    yi.push(yiPool[(seed * 7 + k * 5 + 3) % yiPool.length]);
    ji.push(jiPool[(seed * 11 + k * 4 + 1) % jiPool.length]);
  }

  return {
    lYear, lMonth, lDay, isLeap,
    lunarText: monthText + dayText,
    gzYear, animal, gzDay,
    yi: yi.join(' '),
    ji: ji.join(' ')
  };
}

module.exports = { solar2lunar, getSolarTerm, getFestival };
