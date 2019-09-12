

<template>

<el-container>
    <el-header>
        <div class="logo">

        </div>
        <div>
            <span class="editor">智力猫</span>
            <el-button size='small' @click='logout' type="danger">注销</el-button>
        </div>
    </el-header>
    <el-container>
        <el-aside width="200px">
            <el-menu default-active='2' :router='true' unique-opened>
                <el-menu-item index='1' :route="{name:'cardDetail'}">
                    <span slot="title">预发布</span>
                </el-menu-item>
                <el-menu-item index='2' :route="{name:'editor'}">
                    <span slot="title">图片生成器</span>
                </el-menu-item>
                <el-menu-item index='3' :route="{name:'sources'}">
                    <span slot="title">发现素材</span>
                </el-menu-item>
                <el-menu-item index='4' :route="{name:'cards'}">
                    <span slot="title">日签列表</span>
                </el-menu-item>
                <el-menu-item index='5' :route="{name:'ssn'}">
                    <span slot="title">碎碎念</span>
                </el-menu-item>
                <el-menu-item index='6' :route="{name:'config'}">
                    <span slot="title">设置</span>
                </el-menu-item>
                <el-menu-item index='7' :route="{name:'feedback'}">
                    <span slot="title">用户反馈信息</span>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-main>
            <router-view/>
        </el-main>
    </el-container>
</el-container>

</template>

<script>

export default {
    name: 'frame',
    data() {
        return {

        }
    },
    methods: {
      logout(){
        localStorage.removeItem("token");
        this.$router.replace({name:'login'})
        this.$message({
          message: '管理员已注销',
          type: 'success'
        });
      }
    },
    created(){
      this.bus.$on('logout',this.logout)
    }
}

</script>
