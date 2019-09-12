

<template>

<div>
    <template>
        <el-table :data="data" style="width: 100%">
            <el-table-column prop="date" label="日期" width="180">
            </el-table-column>
            <el-table-column prop="name" label="用户" width="180">
            </el-table-column>
            <el-table-column prop="content" label="内容">
            </el-table-column>
        </el-table>
        <el-button @click='loadmore' v-if='btn' type="primary">加载30条</el-button>
    </template>
</div>

</template>

<script>

export default {
    data() {
            return {
                pager: 0,
                data: [],
                btn: true
            }
        },
        methods: {
            loadmore() {
                    this.pager++
                        this.fetch()
                },
                fetch() {
                    this.axios.get('feedbacks', {
                        params: {
                            pager: this.pager
                        }
                    }).then(({
                        data
                    }) => {
                        if (data.length < 30) {
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
