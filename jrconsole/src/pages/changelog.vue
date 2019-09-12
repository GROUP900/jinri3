

<template>

<div>
    <el-form label-width="90px" label-position='left'>
        <el-form-item label="版本与日期">
            <el-input v-model='title'></el-input>
        </el-form-item>
        <el-form-item label="版本与日期">
            <el-input type="textarea" v-model="detail"></el-input>
        </el-form-item>
        <el-button type="primary" @click='append'>新增</el-button>
    </el-form>
    <el-table :data="changelogs" style="width: 100%">
        <el-table-column prop="title" label="版本" width="180">
        </el-table-column>
        <el-table-column prop="detail" label="内容">
        </el-table-column>
    </el-table>
</div>

</template>

<script>

export default {
    name: 'changelog',
    data() {
        return {
            title: '',
            detail: '',
            changelogs: []
        }
    },
    methods: {
        append() {
            if(!this.title||!this.detail){
              return
            }
                this.axios.post('changelog', {
                    title: this.title,
                    detail: this.detail
                }).then((response) => {
                    this.title = ''
                    this.detail = ''
                    this.$message({
                        message: '追加了',
                        type: 'success'
                    });
                    this.fetch()
                })
            },
            fetch() {
                this.axios('changelogs').then(({
                    data
                }) => {
                    this.changelogs = data
                })
            }
    },
    created() {
        this.fetch()
    }
}

</script>
