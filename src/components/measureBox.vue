<template>
  <div class="scroll-box2">
    <el-scrollbar style="height: 100%">
      <ul class="measure-module">
        <li v-for="(item, index) in measureData" @click="toggleSelectMeasure(item)"
            :class="{'active-li': item.flag}">
          <span>{{item.label}}</span>
          <i class="el-icon-check" v-show="item.flag"></i>
        </li>
      </ul>
    </el-scrollbar>
  </div>
</template>

<script>
  export default {
    name: "measure-box",
    methods: {
      toggleSelectMeasure(params) {
        params.flag = !params.flag
        this.$emit('clickMeasureElement', params)
      },
    },
    props: ['measureData'],
  }
</script>

<style lang="scss" scoped>
  $borderColor: #666;
  $borderColor2: #b3b3b3;
  .scroll-box2 {
    height: 30vh;
    border: 1px solid $borderColor2;
    border-radius: 5px;
  }
  .measure-module {
    li {
      position: relative;
      list-style: none;
      height: 30px;
      line-height: 30px;
      padding: 10px;
      border-bottom: 1px solid #e5e5e5;
      cursor: pointer;
      user-select: none;
      &:hover {
        background-color: #f2f2f2;
      }
      i {
        position: absolute;
        right: 10px;
        top: 15px;
        font-size: 20px;
        font-weight: bold;
      }
    }
    .active-li {
      background-color: #52cc52 !important;
      color: #fff !important;
    }
  }
</style>
