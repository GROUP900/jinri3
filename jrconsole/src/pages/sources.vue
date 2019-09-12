<template>
<div class="sources">
  <el-dialog title="资源预览" :visible.sync="preview.show" width="30%" :before-close="resetPreview">
    <div class="preview">
      <audio :src="dispPreviewUrl" controls autoplay v-if="preview.type=='audio'"></audio>
      <video :src="dispPreviewUrl" controls autoplay v-if="preview.type=='video'"></video>
    </div>
  </el-dialog>
    <el-row>
      <el-alert
        title="这里显示的素材都是没有绑定日签的素材。如果要编辑已经绑定的素材，需要先在日签列表中解绑。"
        type="info">
      </el-alert>
    </el-row>
    <el-row>
        <el-col :span="24">
            <el-button @click='append' type="primary" icon="el-icon-plus">追加新素材</el-button>
        </el-col>
    </el-row>
    <el-row :gutter="16">
      <el-col :key='item.id' @click.native='play(item.type,item.content)' v-for='item of data' :span="3" >
        <el-card :class="'sourcecard ' + item.type">
          <el-button class="dropbtn" type="danger" size='mini' icon="el-icon-delete" @click.stop='drop(item)'></el-button>
          <div class="icon">
            <i></i>
          </div>
          <div class="desc">
            <p>{{item.title}}</p>
            <div>
              <span>{{dispType(item.type)}}</span>
              <el-button type="text" class="button" @click.stop='edit(item.id)'>编辑</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
</div>

</template>

<script>
import {cosDrop} from '../common/cosupload'
export default {
    name: 'sources',
    data() {
        return {
          data:[],
          preview:{
            show:false,
            url:'',
            type:''
          }
        }
    },
    computed:{
      dispPreviewUrl(){
        return this.sourceUrl+this.preview.url
      }
    },
    methods: {
      resetPreview(){
        this.preview.show=false
        this.preview.type = ''
      },
      play(type,url){
        if(type=='post') return
        this.preview.type = type
        this.preview.url = url
        this.preview.show = true
      },
      dispType(type){
        switch(type){
          case 'audio' : return '音频';
          case 'post' : return '文章';
          case 'video' : return '视频';
        }
      },
      append(){
        this.$router.push({name:'appendSource'})
      },
      edit(id){
        this.$router.push({name:'editSource', params: { id }})
      },
      fetchData(){
        this.axios.get('resourcelist').then(({data})=>{
          this.data = data
        })
      },
      async drop(item){
        const loading = this.$loading({
          lock: true
        });
        try{
          switch(item.type){
            case 'audio':
            case 'video':
              await cosDrop(item.content)
              break;
            case 'post':
              let tasks = []
              JSON.parse(item.extra).forEach((item)=>{
                tasks.push(cosDrop(item))
              })
              await Promise.all(tasks)
          }
        }catch(err){
          loading.close();
          this.$message({
            message: '素材物理文件没能成功删除,删除中断',
            type: 'error'
          });
          return;
        }
        await this.axios.delete('resource',{params:{
          id:item.id
        }}).then(()=>{
          this.$message({
            message: '素材已删除',
            type: 'success'
          });
          loading.close();
          this.fetchData()
        }).catch((err)=>{
          loading.close();
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
