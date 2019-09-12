

<template>

<div>
    <el-row>
        <el-col :span="24">
            <el-date-picker @change='monthChanged' v-model='month' type="month" placeholder="选择月" value-format="yyyy-MM">
            </el-date-picker>
        </el-col>
    </el-row>
    <template>
        <el-table :data="data" style="width: 100%">
            <el-table-column prop="date" label="时间" width="100">
            </el-table-column>
            <el-table-column prop="nickname" label="用户" width="100">
            </el-table-column>
            <el-table-column prop="anonymous" label="匿名" width="80">
              <template slot-scope="scope">
                <span v-if='scope.row.anonymous'>匿名</span>
                <span v-else>正常</span>
              </template>
            </el-table-column>
            <el-table-column prop="nocopy" label="授权" width="80">
              <template slot-scope="scope">
                <span v-if='scope.row.nocopy'>不可用</span>
                <span v-else>OK</span>
              </template>
            </el-table-column>
            <el-table-column prop="liked" label="收藏数" width="80">
            </el-table-column>
            <el-table-column prop="funny" label="欢乐值" width="80">
            </el-table-column>
            <el-table-column prop="content" label="内容">
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template slot-scope="scope">
                <el-button v-if='!scope.row.showing' size="mini" @click='toggleSSN(true,scope.$index,scope.row.id)' type="primary" round>通过</el-button>
                <el-button v-else size="mini" @click='toggleSSN(false,scope.$index,scope.row.id)' round>隐藏</el-button>
                <el-button size="mini" @click='drop(scope.$index,scope.row.id)' type="danger" round>删除</el-button>
              </template>
            </el-table-column>
        </el-table>
        <el-button @click='loadmore' v-if='btn' type="primary">加载60条</el-button>
    </template>
</div>

</template>

<script>

import moment from 'moment';
export default {
    data() {
            return {
                month: moment().format('YYYY-MM'),
                page: 0,
                data: [],
                btn: true
            }
        },
        methods: {
          toggleSSN(ifshow,index,id){
            this.axios.put('ssn', {
                  id,
                  ifshow:(ifshow)?1:0
            }).then(({
                data
            }) => {
                this.data[index].showing = !this.data[index].showing
            })
          },
          drop(index,id){
            this.axios.delete('ssn', {
                params: {
                  id
                }
            }).then(({
                data
            }) => {
                this.data.splice(index,1)
            })
          },
            monthChanged() {
              this.data = []
              this.page = 0
              this.btn = true
              this.fetch()
                },
                loadmore() {
                    this.page++
                        this.fetch()
                },
                fetch() {
                    let date = this.month.split('-')
                    this.axios.get('ssn', {
                        params: {
                          year: date[0],
                          month: date[1],
                          page: this.page
                        }
                    }).then(({
                        data
                    }) => {
                        if (data.length < 60) {
                            this.btn = false
                        }
                        this.data = this.data.concat(data)
                    })
                }
        },
        created() {
            this.fetch()
        }
}

</script>
