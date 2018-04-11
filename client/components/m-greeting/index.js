// components/m-greeting/index.js
const FW = require('../../framework/index.js');

FW.Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    firstName: 'Jack',
    lastName: 'Lo'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    greeting() {
      const { firstName, lastName } = this.data;
      console.log(`Hello, ${firstName}.${lastName}`);
    }
  },

  ready() {
    this.greeting();
  }
})
