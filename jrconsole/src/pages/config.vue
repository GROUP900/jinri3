<template>
<div class="config">
  <h3>个人设置</h3>
  <h5>修改密码</h5>
  <el-form label-width="90px" label-position='left'>
    <el-form-item label="输入旧密码">
      <el-input type='password' v-model='password'></el-input>
    </el-form-item>
    <el-form-item label="输入新密码">
      <el-input type='password' v-model='newpassword'></el-input>
    </el-form-item>
    <el-form-item label="重复新密码">
      <el-input type='password' v-model='repeat'></el-input>
    </el-form-item>
    <el-button type="primary" @click='updatepw'>保存</el-button>
  </el-form>
  <h5>用户评论</h5>
  <el-form label-width="120px" label-position='top'>
    <el-form-item label="碎碎念审核">
      <el-select v-model="ssnaudit" placeholder="请选择">
        <el-option key="no" label="直接显示" :value="0">
        </el-option>
        <el-option key="yes" label="手动筛选" :value="1">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="发现评论审核">
      <el-select v-model="discoveraudit" placeholder="请选择">
        <el-option key="no" label="直接显示" :value="0">
        </el-option>
        <el-option key="yes" label="手动筛选" :value="1">
        </el-option>
      </el-select>
    </el-form-item>
    <el-button type="primary" @click='saveSettings'>保存</el-button>
  </el-form>
</div>
</template>

<script>
export default {
  name: 'config',
  data() {
    return {
      password: '',
      newpassword: '',
      repeat: '',
      discoveraudit: '',
      ssnaudit: ''
    }
  },
  methods: {
    updatepw() {
      var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
      switch (true) {
        case (this.newpassword.length < 8):
          this.$message({
            message: '密码太短，能不能注意下网络安全',
            type: 'error'
          });
          return
        case (!this.password || !this.newpassword):
          this.$message({
            message: '能不能都填好了再改密码？',
            type: 'error'
          });
          return
        case (this.newpassword != this.repeat):
          this.$message({
            message: '重复的新密码不一致',
            type: 'error'
          });
          return
        case (this.newpassword == this.password):
          this.$message({
            message: '新密码和旧密码一样，你在玩吗',
            type: 'error'
          });
          return
        case reg.test(this.newpassword):
          this.$message({
            message: '密码里有非法字符',
            type: 'error'
          });
          return
      }
      this.axios.put('config/password', {
        password: this.password,
        newpassword: this.newpassword
      }).then(() => {
        this.$message({
          message: '密码已修改，请重新登录',
          type: 'success'
        });
        this.bus.$emit('logout')
      })
    },
    saveSettings() {
      let data = [
        ['discoveraudit',this.discoveraudit],
        ['ssnaudit',this.ssnaudit]
      ]
      this.axios.put('config/global', data).then(() => {
        this.$message({
          message: '设置已保存',
          type: 'success'
        });
      })
    }
  },
  created() {
    this.axios.get('config/global').then(({
      data
    }) => {
      data.forEach((item) => {
        this[item.item] = item.value
      })
    })
  }
}
</script>
