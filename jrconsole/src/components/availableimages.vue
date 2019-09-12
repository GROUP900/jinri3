<template>
  <el-col :span="12" class="image">
    <el-row :gutter="16">
      <el-col @click.native='use(item)' v-for='item of data' :key='item.id' :span="6" >
        <el-button v-if='!selected || selected.id != item.id' class="dropbtn" type="danger" size='mini' icon="el-icon-delete" @click.stop='drop(item)'></el-button>
        <img :src="dispUrl(item.fronturl)">
      </el-col>
    </el-row>
  </el-col>
</template>

<script>
import {cosDrop} from '../common/cosupload'
export default {
  name: 'availableimages',
  data() {
    return{
      data:[]
    }
  },
  props:['selected'],
  methods:{
    fetchData(){
      this.axios.get('imagelist').then(({data}) => {
        if(data.length==0 && this.$route.name!='editCard'){
          this.$message({
            message: '没获取到可用日签图片，请先增加图片',
            type: 'error'
          });
          this.$router.replace({name:'editor'})
        }
        this.data = data
      }).catch((err)=>{
        console.log(err)
        this.$message({
          message: '图片列表加载失败',
          type: 'error'
        });
      })
    },
    dispUrl(url){
      return this.sourceUrl+url
    },
    use(item){
      this.$emit('usePicture',item)
    },
    async drop(item){
      try{
        let tasks = []
        tasks.push(cosDrop(item.fronturl))
        tasks.push(cosDrop(item.backurl))
        await Promise.all(tasks)
      }catch(err){
        this.$message({
          message: '图片物理文件没能成功删除,删除中断',
          type: 'error'
        });
        return;
      }
      this.axios.delete('image',{params:{
        id:item.id
      }}).then(()=>{
        this.$message({
          message: '图片已删除',
          type: 'success'
        });
        this.fetchData()
      }).catch((err)=>{
        console.log(err)
        this.$message({
          message: '删除失败',
          type: 'error'
        });
      })
    }
  },
  created(){
    this.fetchData()
  }
}
</script>
