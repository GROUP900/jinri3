<template>
  <el-col :span="12" class="sources">
    <el-row :gutter="16">
      <el-col :span="6" @click.native='use(item)' :key='item.id' v-for='item of data'>
        <el-card :class="'sourcecard ' + item.type">
          <div class="icon">
            <i></i>
          </div>
          <div class="desc">
            <p>{{item.title}}</p>
            <div>
              <span>{{dispType(item.type)}}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </el-col>
</template>

<script>
export default {
  name: 'availablesources',
  data() {
    return{
      data:[]
    }
  },
  methods:{
    dispType(type){
      switch(type){
        case 'audio' : return '音频';
        case 'post' : return '文章';
        case 'video' : return '视频';
      }
    },
    use(item){
      this.$emit('useSource',item)
    }
  },
  created(){
    this.axios.get('resourcelist').then(({data}) => {
      this.data = data
    }).catch((err)=>{
      this.$message({
        message: '资源列表加载失败',
        type: 'error'
      });
    })
  }
}
</script>
