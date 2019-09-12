<template>
<div class="source-editor">
  <el-row :gutter="16">
    <el-col :span="8">
      <div class="user">
        <el-form label-width="80px" label-position='left' v-if="$route.name == 'appendSource'">
          <el-form-item label="附件类型">
            <el-select v-model="type" placeholder="选择附件类型">
              <el-option key="audio" label="音频" value="audio">
              </el-option>
              <el-option key="post" label="文章" value="post">
              </el-option>
              <el-option key="video" label="视频" value="video">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div v-if="type=='audio'">
          <el-form label-width="80px" label-position='left'>
            <el-form-item label="音频名称">
              <el-input v-model='title' placeholder='音频的名字或歌名'></el-input>
            </el-form-item>
            <el-form-item label="艺术家">
              <el-input v-model='author' placeholder='格式：专辑名(年代)/艺术家'></el-input>
            </el-form-item>
            <el-form-item label="音频">
              <input type="file" accept='audio/mpeg' ref='audioInput'>
            </el-form-item>
          </el-form>
        </div>
        <div v-if="type=='video'">
          </el-alert>
          <el-form label-width="80px" label-position='left'>
            <el-form-item label="视频标题">
              <el-input v-model='title' placeholder='视频标题'></el-input>
            </el-form-item>
            <el-form-item label="视频作者">
              <el-input v-model='author' placeholder='作者名'></el-input>
            </el-form-item>
            <el-form-item label="视频(MP4)">
              <input type="file" accept='video/mp4' ref='videoInput'>
            </el-form-item>
          </el-form>
        </div>
        <div v-if="type=='post'">
          <p class="hint">
            文章的定义：<br>小程序限制不允许外联音视频，所以文章的内容只应该包含文字和图片。<br> 同时文章素材也不适合做大量图的图集，展示的情景只对应大段文字有较好的展示效果，应该避免图片大于文字的情况。
            <br> 另外文章排版需要使用markdown语法，如果不会找智力猫给你输入。
            <br>
          </p>
          <el-form label-width="80px" label-position='left'>
            <el-form-item label="文章标题">
              <el-input v-model='title' placeholder='文章标题'></el-input>
            </el-form-item>
            <el-form-item label="作者">
              <el-input v-model='author' placeholder='格式(如果是转载的):媒体-作者'></el-input>
            </el-form-item>
          </el-form>
          <el-form label-width="80px" label-position='top'>
            <el-form-item label="正文（markdown）">
              <el-input type="textarea" :autosize="{ minRows: 5, maxRows: 100}" v-model="md">
              </el-input>
            </el-form-item>
          </el-form>
          <input type="file" accept='image/jpeg,image/png' @change='appendImageToPost' id='postimageinput' hidden>
          <label class="uploadimage" for="postimageinput">
                    <p>上传图片</p>
                    <span>图片是立即上传的，如果不删除文章，同时上传的图片会一直留在服务器，这些空间是花钱的，麻烦想好了再上传。</span>
                  </label>
        </div>
        <div class="save">
          <el-button type="success" @click='submit' v-if='type'>保存</el-button>
        </div>
      </div>
    </el-col>
    <el-col v-if="type=='post'" :span="12">
      <div class="preview">
        <div v-if="type=='audio'||type=='video'" class="audio">
          <p class="title">{{title}}</p>
          <p class="author">{{author}}</p>
        </div>
        <div v-else class="post">
          <p class='help'>markdown转换为html的结果仅用来检查语法，不是在小程序的最终显示效果</p>
          <p class="author">{{author}}</p>
          <p class="title">{{title}}</p>
          <div v-html='compiled' class='compiled'>

          </div>
        </div>
      </div>
    </el-col>
  </el-row>
</div>
</template>

<script>
import marked from 'marked';
import {
  cosUpload
} from '../common/cosupload'
export default {
  name: 'sourceEditor',
  data() {
    return {
      type: '',
      title: '',
      author: '',
      md: '',
      uploaded: new Set()
    }
  },
  computed: {
    compiled() {
      return marked(this.md)
    }
  },
  created() {
    if (this.$route.name == 'editSource') {
      const loading = this.$loading({
        lock: true
      });
      this.axios.get('resource', {
        params: {
          id: this.$route.params.id
        }
      }).then(({
        data
      }) => {
        this.title = data.title;
        this.author = data.author;
        this.type = data.type;
        if (data.type == 'post') {
          this.md = data.content
          this.uploaded = new Set(JSON.parse(data.extra))
        }
        loading.close();
      }).catch((err) => {
        loading.close();
        this.$message({
          message: '没有获取到指定数据',
          type: 'error'
        });
        this.$router.replace({
          name: 'sources'
        })
      })
    }
  },
  methods: {
    submit() {
      if (!this.title || !this.author) {
        this.$message({
          message: '作者和标题都是必填的',
          type: 'warning'
        });
        return;
      }
      switch (this.type) {
        case 'audio':
        case 'video':
          this.saveAV()
          break;
        case 'post':
          this.savePost();
      }
    },
    async appendImageToPost(ev) {
      const loading = this.$loading({
        lock: true
      });
      try {
        let file = ev.target.files[0]
        let time = Date.now()
        let {
          Key: url
        } = await cosUpload(file, time, 'images/');
        this.uploaded.add(url)
        url = this.cdnUrl + '/' + url;
        let result = `![](${url})`
        this.md += result
        this.$message({
          message: '图片已插入到文章末尾',
          type: 'success'
        });
        loading.close();
      } catch (e) {
        console.log(e)
        loading.close();
        this.$message({
          message: '资源服务器挂了，找智力猫看一下。',
          type: 'error'
        });
        return
      }
    },
    async savePost() {
      if (!this.md) {
        this.$message({
          message: '没有内容没法保存',
          type: 'error'
        });
        return;
      }
      const loading = this.$loading({
        lock: true
      });
      try {
        let extra = JSON.stringify(Array.from(this.uploaded));
        let content = marked(this.md);
        let data = {
          title: this.title,
          author: this.author,
          type: this.type,
          extra,
          content: this.md
        }
        let bundle = {
          data,
          method: 'post',
          url: 'resource'
        }
        if (this.$route.name == 'editSource') {
          bundle.method = 'put'
          bundle.params = {
            id: this.$route.params.id
          }
        }
        await this.axios(bundle).then(() => {
          this.$message({
            message: '素材已保存',
            type: 'success'
          });
          loading.close();
          this.$router.push({
            name: 'sources'
          })
        })
      } catch (e) {
        console.log(e)
        loading.close();
        this.$message({
          message: '接口错误，找智力猫看一下。',
          type: 'error'
        });
        return
      }
    },
    async saveAV() {
      let file = null
      if (this.type == 'video') {
        file = this.$refs.videoInput.files[0]
      } else {
        file = this.$refs.audioInput.files[0]
      }
      if (!file && this.$route.name != 'editSource') {
        this.$message({
          message: '文件没选中,你保存个屌',
          type: 'error'
        });
        return;
      }
      const loading = this.$loading({
        lock: true
      });
      try {
        let data;
        //如果fileinput有内容或者是新增模式，都会触发上传，并且包中带content
        //反之，那只可能是编辑模式同时不更新文件的情况
        if (file || this.$route.name != 'editSource') {
          let time = Date.now()
          let {
            Key: content
          } = await cosUpload(file, time + '-' + this.type, 'resources/');
          data = {
            title: this.title,
            author: this.author,
            type: this.type,
            content
          }
        } else {
          data = {
            title: this.title,
            author: this.author,
            type: this.type
          }
        }
        let bundle = {
          data,
          method: 'post',
          url: 'resource'
        }
        if (this.$route.name == 'editSource') {
          bundle.method = 'put'
          bundle.params = {
            id: this.$route.params.id
          }
        }
        await this.axios(bundle).then(() => {
          this.$message({
            message: '素材已保存',
            type: 'success'
          });
          loading.close();
          this.$router.push({
            name: 'sources'
          })
        })
      } catch (e) {
        console.log(e)
        loading.close();
        this.$message({
          message: '资源服务器挂了，找智力猫看一下。',
          type: 'error'
        });
        return
      }
    }
  }
}
</script>
