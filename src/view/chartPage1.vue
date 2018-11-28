<template>
  <div class="demo1">
    <div class="header">
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="select-module">
            <div class="title">选择可视化表</div>
            <el-select v-model="value1" placeholder="请选择" style="width: 100%;">
              <el-option
                v-for="item in value1Options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
        </el-col>
        <el-col :span="20">
          <div class="title">Custom Report</div>
          <div class="dragDrop-module">
            <!--<draggable v-model="selectMeasureValue" element="div">-->
              <el-tag
                v-for="tag in selectMeasureValue"
                :key="tag.label"
                :closable="true"
                @close="delTag(tag)"
                :type="tag.type">
                {{tag.label}}
              </el-tag>
            <!--</draggable>-->
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="main">
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="title">维度</div>
          <el-select v-model="dimensionValue" placeholder="请选择" style="width: 100%;">
            <el-option
              v-for="item in dimensionData"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
          <div class="title">度量</div>
          <m-chart-box :measureData="measureData" v-model="selectMeasureValue"></m-chart-box>
        </el-col>
        <el-col :span="20">
          <div class="title">
            <div style="display: inline-block">
              Chart
              <i class="iconfont icon-biaoge1"></i>
            </div>
            <div style="cursor: pointer;display: inline-block; font-size: 14px; margin-left: 30px; color: #409eff;"
                 @click="goTablePage">
              切换为表格
              <i class="iconfont icon-chaolianjie"></i>
            </div>
          </div>

          <div class="content-chart" v-loading="tableLoading">
            <div class="echart" id="echart1"></div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  // import draggable from 'vuedraggable'
  import {AgGridVue} from "ag-grid-vue";
  import mChartBox from '../components/mChartBox'

  export default {
    data() {
      return {
        dimensionValue: '',
        dimensionData: [],
        selectMeasureValue: [],
        tableLoading: false,
        // baseApi: 'http://10.122.33.101:9095',
        baseApi: 'https://demo-api.cbitest.lenovo.com',
        value1: 'cbi_overview_demo',
        value1Options: [
          {
            value: 'cbi_overview_demo',
            label: 'OverView'
          },
          // {
          //   value: 'Custom',
          //   label: 'Custom'
          // },
        ],
        measureData: [],
        echartsObj: {
          echart1: null
        },
        ehcartsOptionsData: {
          echart1: {}
        },
        colorArr: ['#37a2da', '#9fe6b8', '#ffdb5c', '#fb7293', '#96bfff']
      }
    },
    methods: {
      goTablePage() {
        this.$router.push({path: '/'})
      },
      delTag(params) {
        console.log(params, '要移除的')
        params.flag = false // 和菜单栏形成联系
        // 控制拖拽组件的
        let index
        for (let i in this.selectMeasureValue) {
          if (this.selectMeasureValue[i].label === params.label) {
            index = i
          }
        }
        this.selectMeasureValue.splice(index, 1) // selectMeasureValue现在是双向绑定，所以父子组件通过它来双向联动
      },
      initPage() {
        this.initConditionData()
      },
      async initConditionData() {
        let params = {
          table: this.value1
        }
        let res = await this.axios.post(`${this.baseApi}/custom/report/condition`, params)
        // console.log(res,'结果')
        let resData = res.data.data
        this.dimensionData = resData.dimension.map(item => {
          if (item.flag === true) {
            this.dimensionValue = item.value
          }
          return {
            value: item.value,
            label: item.label,
            flag: item.flag
          }
        })
        this.measureData = resData.group.map(item => {
          return {
            value: item.value,
            label: item.label,
            flag: item.flag,
            type: 'warning'
          }
        })
        this.selectMeasureValue = this.measureData.filter(item => {
          return item.flag === true
        })

        this.getEchartData()
      },
      async getEchartData() {
        let params = {
          table: this.value1,
          x: this.dimensionValue,
          y: this.selectMeasureValue.map(item => item.value)
        }
        let res = await this.axios.post(`${this.baseApi}/custom/report/chart`, params)
        let resData = res.data.data
        if (Object.keys(resData).length === 0) {
          this.$message({
            message: 'No data under your search criteria',
            type: 'warning'
          });
          this.echartsObj.echart1.clear() //因为无数据，所以清空ehcarts
        } else {
          this.ehcartsOptionsData.echart1 = resData
          this.loadEchart1()
        }
      },
      loadEchart1() {
        this.echartsObj.echart1.clear() //避免echarts渲染bug
        let legendData = Object.keys(this.ehcartsOptionsData.echart1.y)
        let xData = this.ehcartsOptionsData.echart1.x
        let seriesData = []
        for (let i in this.ehcartsOptionsData.echart1.y) {
          seriesData.push({
            name: i,
            type: 'bar',
            data: this.ehcartsOptionsData.echart1.y[i], // .不到，得用[]才可以
            lineStyle: {
              normal: {
                width: 4
              }
            },
            // smooth: true,
          })
        }
        let option = {
          color: this.colorArr,
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              // type: 'cross',
              // crossStyle: {
              //   color: '#999'
              // }
              type: 'shadow'
            }
          },
          toolbox: {
            feature: {
              magicType: {show: true, type: ['line', 'bar']},
              restore: {show: true},
            }
          },
          legend: {
            // data:['蒸发量','降水量','平均温度']
            data: legendData
          },
          xAxis: [
            {
              type: 'category',
              // data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
              data: xData,
              axisPointer: {
                type: 'shadow'
              },
              axisLine: {
                lineStyle: {
                  color: '#f5f5f9'
                }
              },
              axisLabel: {
                color: '#959eaf',
              },
            }
          ],
          yAxis: {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: '#f5f5f9'
              }
            },
            axisLabel: {
              color: '#959eaf'
            },
            splitLine: {
              lineStyle: {
                color: ['#f5f5f9']
              }
            },
          },
          series: seriesData
          // series: [
          //   {
          //     name:'蒸发量',
          //     type:'bar',
          //     data:[2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3]
          //   },
          //   {
          //     name:'降水量',
          //     type:'bar',
          //     data:[2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3]
          //   },
          //   {
          //     name:'平均温度',
          //     type:'line',
          //     yAxisIndex: 1,
          //     data:[2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2]
          //   }
          // ]
        };
        this.echartsObj.echart1.setOption(option)
      }
    },
    components: {
      // draggable,
      mChartBox,
    },
    watch: {
      selectMeasureValue: function (nVal, oVal) {
        // 减少请求次数
        // 有问题啊，，打印出的新旧俩值后几次都一样了，，，神问号？？？？
        // console.log(nVal,'新',oVal, '旧')
        // if (nVal.length === oVal.length) {
        //   return
        // } else {
          this.getEchartData()
        // }
      },
      dimensionValue: function (nVal) {
        this.getEchartData()
      }
    },
    created() {
      this.initPage()
    },
    mounted() {
      this.echartsObj.echart1 = this.echarts.init(document.getElementById('echart1'))
      window.onresize = item => {
        this.echartsObj.echart1.resize()
      }
    }
  }
</script>

<style lang="scss" scoped>
  $borderColor: #666;
  $borderColor2: #b3b3b3;
  .demo1 {
    position: relative;
    padding: 20px;
    color: $borderColor;
    .dragDrop-module {
      border: 1px solid $borderColor2;
      border-radius: 5px;
      min-height: 32px;
      position: relative;
      padding: 5px;
      .el-tag {
        margin-right: 5px;
        cursor: pointer;
      }
    }
    .main {
      .dimension-module, .measure-module {
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
      .content-chart {
        .echart {
          width: 100%;
          height: 55vh;
          /*height: 500px;*/
        }
      }

    }
    .title {
      font-weight: bold;
      font-size: 16px;
      margin: 5px 0;
    }
  }
</style>
<style lang="scss">
  .demo1 {
    .main {
      .el-scrollbar__wrap {
        overflow-x: hidden;
      }
    }
  }
</style>
