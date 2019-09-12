<template>
<div class="card-detail">
  <el-row>
    <el-col :span="24">
      <div class="head" v-if="$route.name!='editCard'">
        <div class="date">
          <span>日签发布日期</span>
          <el-date-picker v-model="day" type="date" placeholder="选择日期">
          </el-date-picker>
        </div>
        <div>
          <el-button :disabled='integrity' @click='submit' type="primary">发布</el-button>
        </div>
      </div>
      <div class="head" v-else>
        <el-button @click='save' type="primary">保存</el-button>
      </div>
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="24">
      <h3>预览</h3>
      <div class="preview">
        <div>
          <img class="image" v-if='image' :src="dispUrl(image.fronturl)">
          <div class="btns" v-if='source'>
            <el-button v-if="$route.name=='editCard'&&saved.imageid!=image.id" @click="revoke('image')" class="drop" type="primary">还原</el-button>
          </div>
        </div>
        <div>
          <el-card v-if='source' :class="'sourcecard ' + source.type">
            <div class="icon">
              <i></i>
            </div>
            <div class="desc">
              <p>{{source.title}}</p>
              <div>
                <span>{{dispType(source.type)}}</span>
              </div>
            </div>
          </el-card>
          <div class="btns" v-if='source'>
            <el-button @click='source = null' class="drop" type="danger">解除绑定</el-button>
            <el-button v-if="$route.name=='editCard'&&saved.resourceid!=source.id" @click="revoke('resource')" class="drop" type="primary">还原</el-button>
          </div>
        </div>
      </div>
    </el-col>
  </el-row>
  <el-row class="list">
    <h3>选取素材</h3>
    <availableImages :selected='image' @usePicture='usePicture' />
    <availableSources @useSource='useSource' />
  </el-row>
</div>
</template>

<script>
import availableImages from './availableimages'
import availableSources from './availableSources'
import moment from 'moment';
export default {
  name: 'cardDetail',
  data() {
    return {
      day: new Date().toString(),
      image: null,
      source: null,
      saved: {}
    }
  },
  computed: {
    integrity() {
      return (!this.image) ? true : false
    }
  },
  methods: {
    revoke(type) {
      let data = this.saved
      switch (type) {
        case 'image':
          this.image = {
            id: data.imageid,
            fronturl: data.fronturl
          }
          break;
        case 'resource':
          if (data.resourceid) {
            this.source = {
              id: data.resourceid,
              title: data.title,
              type: data.type
            }
          }
          break;
      }
    },
    save() {
      let data = {
        resourceid: (this.source) ? this.source.id : null,
        imageid: this.image.id
      }
      let bundle = {
        data,
        url:'riqian',
        params: {
          id: this.saved.id
        },
        method:'put'
      }
      this.axios(bundle).then((response) => {
        this.$message({
          message: '日签已更新',
          type: 'success'
        });
        this.$router.push({
          name: 'cards'
        })
      }).catch((err) => {
        console.log(err)
        this.$message({
          message: '保存失败',
          type: 'error'
        });
      })
    },
    submit() {
      let data = {
        resourceid: (this.source) ? this.source.id : null,
        imageid: this.image.id,
        date: moment(this.day).format('YYYY-MM-DD')
      }
      this.axios.post('riqian', data).then((response) => {
        this.$message({
          message: '日签已经保存，将在指定日期推送给用户',
          type: 'success'
        });
        this.$router.push({
          name: 'cards'
        })
      }).catch((err) => {
        console.log(err)
        this.$message({
          message: '保存失败,可能是因为日期重复',
          type: 'error'
        });
      })
    },
    dispType(type) {
      switch (type) {
        case 'audio':
          return '音频';
        case 'post':
          return '文章';
        case 'video':
          return '视频';
      }
    },
    dispUrl(url) {
      return this.sourceUrl + url
    },
    usePicture(item) {
      this.image = item
    },
    useSource(item) {
      this.source = item
    }
  },
  components: {
    availableImages,
    availableSources
  },
  created() {
    if (this.$route.name == 'editCard') {
      this.axios.get('riqian', {
        params: {
          id: this.$route.params.id
        }
      }).then(({
        data
      }) => {
        this.saved = data
        this.revoke('image')
        this.revoke('resource')
      }).catch((err) => {
        console.log(err)
        this.$message({
          message: '加载失败，请刷新',
          type: 'error'
        });
      })
    }
  }
}
</script>
