

<template>

<div class="login">
    <div class="board" v-loading="logging">
        <div class="logo"></div>
        <el-input placeholder="用户名" @keyup.enter.native="submit" v-model="username" clearable>
        </el-input>
        <el-input placeholder="密码" @keyup.enter.native="submit" v-model="password" type='password' clearable>
        </el-input>
        <el-button type="primary" @click='submit'>登录</el-button>
    </div>
</div>

</template>

<script>

export default {
    name: 'login',
    data() {
        return {
          username:'',
          password:'',
          logging:false
        }
    },
    methods:{
      submit(){
        if(!this.username||!this.password){
          this.$message({
            message: '用户名或者密码没填',
            type: 'warning'
          });
          return
        }
        this.logging = true
        this.axios.post('login',{
          username:this.username,
          password:this.password
        }).then((response)=>{
          localStorage.token = response.data.jwt
          this.$router.push({name:'editor'})
        }).catch((err)=>{
          this.$message({
            message: '用户名或者密码错误',
            type: 'error'
          });
          this.logging = false
        })
      }
    }
}

</script>
