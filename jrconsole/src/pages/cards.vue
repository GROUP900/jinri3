<template>
<div class="cards">
  <el-row>
    <el-col :span="24">
      <el-date-picker @change='fetchData' v-model='month' type="month" placeholder="选择月" value-format="yyyy-MM">
      </el-date-picker>
    </el-col>
  </el-row>
  <el-row :gutter="16">
    <el-col :span="4" v-for='item of data' :key='item.id' @click.native='edit(item.id)'>
      <div class="card">
        <el-button class="dropbtn" type="danger" size='mini' icon="el-icon-delete" @click.stop='drop(item.id)'></el-button>
        <img :src="dispUrl(item.fronturl)">
      </div>
    </el-col>
  </el-row>
</div>
</template>

<script>
import moment from 'moment';
export default {
  name: 'cards',
  data() {
    return {
      month: moment().format('YYYY-MM'),
      data: []
    }
  },
  methods: {
    dispUrl(url) {
      return this.sourceUrl + url
    },
    edit(id) {
      this.$router.push({
        name: 'editCard',
        params: {
          id
        }
      })
    },
    drop(id) {
      this.axios.delete('riqian', {
        params: {
          id
        }
      }).then(() => {
        this.$message({
          message: '素材已删除',
          type: 'success'
        });
        this.fetchData()
      }).catch((err) => {
        console.log(err)
        this.$message({
          message: '删除失败',
          type: 'error'
        });
      })
    },
    fetchData() {
      let date = this.month.split('-')
      this.axios.get('riqians', {
        params: {
          year: date[0],
          month: date[1]
        }
      }).then(({
        data
      }) => {
        if (!data[0]) {
          this.$message({
            message: '所选月份没有日签',
            type: 'warning'
          });
        }
        this.data = data
      }).catch((err) => {
        console.log(err)
        this.$message({
          message: '获取日签数据失败',
          type: 'error'
        });
      })
    }
  },
  created() {
    this.fetchData()
  }
}
</script>
