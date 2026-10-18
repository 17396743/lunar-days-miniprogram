Page({
  data: {
    days: [],
    showAdd: false,
    editingId: null,
    newName: '',
    newDate: '',
    repeat: true
  },

  onShow() {
    this.load();
  },

  load() {
    const list = wx.getStorageSync('days') || [];
    const days = list
      .map(item => {
        const count = this.calcDays(item.date, item.repeat);
        return { ...item, count, isNear: count >= 0 && count <= 7 };
      })
      .sort((a, b) => a.count - b.count);
    this.setData({ days });
  },

  // 核心算法：剩余天数；repeat=true 时按最近一次的周年日计算（生日类）
  calcDays(dateStr, repeat) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr.replace(/-/g, '/'));
    target.setHours(0, 0, 0, 0);
    if (repeat) {
      target.setFullYear(today.getFullYear());
      if (target < today) target.setFullYear(today.getFullYear() + 1);
    }
    return Math.round((target - today) / 86400000);
  },

  openAdd() {
    this.setData({ showAdd: true, editingId: null, newName: '', newDate: '', repeat: true });
  },

  // 点击条目：编辑
  openEdit(e) {
    const id = e.currentTarget.dataset.id;
    const item = (wx.getStorageSync('days') || []).find(it => it.id === id);
    if (!item) return;
    this.setData({
      showAdd: true,
      editingId: id,
      newName: item.name,
      newDate: item.date,
      repeat: item.repeat
    });
  },

  closeAdd() {
    this.setData({ showAdd: false, editingId: null });
  },

  // 空函数：阻止弹层内点击穿透到遮罩关闭弹层
  noop() {},

  onNameInput(e) {
    this.setData({ newName: e.detail.value });
  },

  onDateChange(e) {
    this.setData({ newDate: e.detail.value });
  },

  onRepeatChange(e) {
    this.setData({ repeat: e.detail.value });
  },

  save() {
    const { newName, newDate, repeat, editingId } = this.data;
    if (!newName.trim()) {
      wx.showToast({ title: '请输入名称', icon: 'none' });
      return;
    }
    if (!newDate) {
      wx.showToast({ title: '请选择日期', icon: 'none' });
      return;
    }
    const list = wx.getStorageSync('days') || [];
    if (editingId) {
      // 编辑已有条目
      const idx = list.findIndex(it => it.id === editingId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], name: newName.trim(), date: newDate, repeat };
      }
    } else {
      list.push({ id: Date.now(), name: newName.trim(), date: newDate, repeat });
    }
    wx.setStorageSync('days', list);
    this.setData({ showAdd: false, editingId: null });
    this.load();
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  // 长按：删除
  remove(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除',
      content: '确定删除这个日子吗？',
      success: (res) => {
        if (res.confirm) {
          const list = (wx.getStorageSync('days') || []).filter(item => item.id !== id);
          wx.setStorageSync('days', list);
          this.load();
        }
      }
    });
  },

  // 备份：复制 JSON 到剪贴板
  backup() {
    const list = wx.getStorageSync('days') || [];
    if (list.length === 0) {
      wx.showToast({ title: '没有可备份的数据', icon: 'none' });
      return;
    }
    wx.setClipboardData({
      data: JSON.stringify(list),
      success: () => {
        wx.showModal({
          title: '备份成功',
          content: '数据已复制到剪贴板，粘贴到备忘录/微信文件传输助手保存即可',
          showCancel: false
        });
      }
    });
  },

  // 恢复：从剪贴板导入
  restore() {
    wx.getClipboardData({
      success: (res) => {
        let list;
        try {
          list = JSON.parse(res.data);
        } catch (e) {
          list = null;
        }
        const valid = Array.isArray(list) && list.every(it =>
          it && typeof it.name === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(it.date)
        );
        if (!valid) {
          wx.showToast({ title: '剪贴板中没有备份数据', icon: 'none' });
          return;
        }
        // 规整字段，重新分配 id
        const clean = list.map((it, i) => ({
          id: Date.now() + i,
          name: String(it.name).slice(0, 20),
          date: it.date,
          repeat: !!it.repeat
        }));
        wx.setStorageSync('days', clean);
        this.load();
        wx.showToast({ title: `已恢复 ${clean.length} 条`, icon: 'success' });
      },
      fail: () => {
        wx.showToast({ title: '读取剪贴板失败', icon: 'none' });
      }
    });
  }
});
