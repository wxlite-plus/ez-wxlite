// pages/test/index.js
const FW = require('../../framework/index.js');

FW.Page({

  /**
   * 页面的初始数据
   */
  data: {
    winInfoStr: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.getWinInfo();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
  
  },

  /**
   * 获取系统信息
   */
  getWinInfo() {
    const winInfo = wx.getSystemInfoSync();

    this.setData({
      winInfoStr: JSON.stringify(winInfo)
    });
  },

  /**
   * 长按复制系统信息
   */
  copyWinInfo() {
    const { winInfoStr } = this.data;

    wx.setClipboardData({
      data: winInfoStr,
      success() {
        wx.showToast({
          title: '系统信息复制成功'
        });
      }
    });
  }
})