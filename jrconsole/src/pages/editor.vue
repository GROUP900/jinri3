

<template>

<div class="editor">

    <el-dialog title="🤔 这样可以吗" width="30%" :visible.sync="previewDialog">
        <div class="finalpreview">
            <div>
                <img :src="imageData.dataurl.front">
            </div>
            <div>
                <img :src="imageData.dataurl.wp">
            </div>
        </div>
        <span slot="footer" class="dialog-footer">
      <el-button @click='previewDialog = false'>返回编辑</el-button>
      <el-button type="primary" @click='startUpload'>保存</el-button>
    </span>
    </el-dialog>

    <el-dialog title="直接上传" width="30%" :visible.sync="directUpload">
        <div class="directupload">
          <h3>正面</h3>
          <input accept='image/jpeg,image/png' type="file" ref='directFront'>
          <h3>背面</h3>
          <input accept='image/jpeg,image/png' type="file" ref='directBack'>
          <h3>手动键入日签的文字内容</h3>
          <el-input v-model='content' type="textarea" :autosize="{ minRows: 2, maxRows: 5}" placeholder="请限制内容在五行以内">
          </el-input>
        </div>
      <span slot="footer" class="dialog-footer">
      <el-button @click='directUpload = false'>取消</el-button>
      <el-button type="primary" @click='startDirectUpload'>保存</el-button>
    </span>
    </el-dialog>

    <div class="preview">
        <div class="capturezone" :class='{output:exporting}'>
            <div class="wrapper">
                <div class="extra v2" v-if='imageMode'>
                    <div class="date">
                        <p>{{dispDate.day}}</p>
                        <span>{{dispDate.month}}</span>
                    </div>
                    <div class="vol">
                        VOLUME.{{vol}}
                    </div>
                    <div class="logo">

                    </div>
                    <div class="qr">

                    </div>
                    <div class="poem">
                        <p v-html='dispContent'>
                        </p>
                    </div>
                </div>
                <div class="copy" v-if='!imageMode'>

                </div>
                <div class="overlay" v-if='imageMode' :style='overlayStyle'>

                </div>
                <div class="overlay" v-else-if='!wpsetting.removeoverlay' :style='overlayStyle'>

                </div>
                <div v-if='imageMode||!imageMode&&!wpsetting.removefilter' :class="imageClass" :style='tuneStyleCssgram'>
                    <img :style='tuneStyleCssco' :src="imageSrc">
                </div>
                <div v-else class="image">
                    <img :src="imageSrc">
                </div>
            </div>
        </div>
    </div>
    <div class="config">
        <div class="bar">
            <div>
                <input type="file" accept='image/jpeg,image/png' ref='backgroundinput' @change="applybgtocanvas($event)" hidden>
                <el-button @click='changeBg' round type="primary">换图</el-button>
                <el-button @click='imageMode = !imageMode' round type="primary">{{imageMode?'切换成墙纸':'切换成日签'}}</el-button>
            </div>
            <div>
                <el-button type="success" round @click='saveImage'>下载图片</el-button>
                <el-button type="primary" round @click='directUpload = true'>直接上传图片</el-button>
                <el-button type="primary" round @click='upload'>保存</el-button>
            </div>
        </div>
        <el-tabs v-model="activedTab" type="card">
            <el-tab-pane label="附加信息" name="extra">
                <el-form label-width="80px" label-position='left'>
                    <el-form-item label="显示期数">
                        <el-input v-model='vol' placeholder='如：081' type='number'></el-input>
                    </el-form-item>
                    <el-form-item label="日期">
                        <el-date-picker v-model='date' type="date" placeholder="选择日期">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="内容">
                        <el-input v-model='content' type="textarea" :autosize="{ minRows: 2, maxRows: 5}" placeholder="请限制内容在五行以内">
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
            <el-tab-pane label="微调" name="tune">
                <h3>调整</h3>
                <div class="tunewrapper">
                    <el-form label-width="80px" label-position='top' class="tune">
                        <el-form-item v-model='contrast' label="对比度">
                            <el-slider :min='0' :max='200' :format-tooltip="tuneformat" v-model='contrast'></el-slider>
                        </el-form-item>
                        <el-form-item label="亮度">
                            <el-slider :min='0' :max='200' :format-tooltip="tuneformat" v-model='brightness'></el-slider>
                        </el-form-item>
                        <el-form-item label="饱和度">
                            <el-slider :min='0' :max='200' :format-tooltip="tuneformat" v-model='saturate'></el-slider>
                        </el-form-item>
                        <el-form-item label="褐色转换(sepia)">
                            <el-slider :min='0' :max='100' :format-tooltip="tuneformat" v-model='sepia'></el-slider>
                        </el-form-item>
                    </el-form>
                    <el-form label-width="80px" label-position='top' class="tune">
                        <el-form-item label="灰度">
                            <el-slider :min='0' :max='100' :format-tooltip="tuneformat" v-model='grayscale'></el-slider>
                        </el-form-item>
                        <el-form-item label="反色">
                            <el-slider :min='0' :max='100' :format-tooltip="tuneformat" v-model='invert'></el-slider>
                        </el-form-item>
                        <el-form-item label="色相旋转(hue rotate)">
                            <el-slider :min='-20' :max='360' :format-tooltip="tuneformatdeg" v-model='huerotate'></el-slider>
                        </el-form-item>
                    </el-form>
                </div>
                <el-button type="primary" @click='resetTune' round>重置</el-button>
                <h3>叠加</h3>
                <el-form label-width="80px" label-position='left' class="tune">
                    <el-form-item label="叠加类型">
                        <el-select v-model="overlaymode" placeholder="请选择">
                            <el-option key="corner" label="暗角" value="corner">
                            </el-option>
                            <el-option key="full" label="整个叠加" value="full">
                            </el-option>
                            <el-option key="none" label="无叠加" value="none">
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item v-if="overlaymode =='full'" label="叠加颜色">
                        <el-color-picker show-alpha v-model='overlayColor.full' size="small"></el-color-picker>
                    </el-form-item>
                    <el-form-item v-if="overlaymode =='corner'" label="外圈">
                        <el-color-picker show-alpha v-model='overlayColor.outter' size="small"></el-color-picker>
                    </el-form-item>
                    <el-form-item v-if="overlaymode =='corner'" label="中心">
                        <el-color-picker show-alpha v-model='overlayColor.inner' size="small"></el-color-picker>
                    </el-form-item>

                </el-form>
            </el-tab-pane>
            <el-tab-pane label="滤镜" name="filter">
                <div @click='changeFilter($event)'>

                    <h3>CSSCO</h3>
                    <div class="filters">
                        <div v-for='item in csscoClassList'>
                            <div :class="'cssco '+item">
                                <img :src="imageSrc">
                            </div>
                            <p>{{item}}</p>
                            <el-button type="primary" size='small' :data-class="'cssco '+item" round>用这个</el-button>
                        </div>
                    </div>
                    <h3>CSSGram</h3>
                    <div class="filters">
                        <div v-for='item in cssgramClassList'>
                            <div :class="item">
                                <img :src="imageSrc">
                            </div>
                            <p>{{item}}</p>
                            <el-button type="primary" size='small' :data-class="item" round>用这个</el-button>
                        </div>
                    </div>
                    <h3>移除滤镜</h3>
                    <div class="filters">
                        <div>
                            <div>
                                <img :src="imageSrc">
                            </div>
                            <p>无滤镜</p>
                            <el-button type="primary" size='small' data-class="none" round>用这个</el-button>
                        </div>
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="主题" name="theme">
                <div class="themes">
                    <div>
                        <p><img src="../assets/v2.jpg"></p>
                        <el-button type="primary" round size='small' disabled>正在使用</el-button>
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="设置" name="config">
                <h3>壁纸导出设置</h3>
                <el-form label-position='left' class="tune">
                    <el-form-item>
                        <el-checkbox v-model='wpsetting.removeoverlay'>去除叠加遮罩</el-checkbox>
                    </el-form-item>
                    <el-form-item>
                        <el-checkbox v-model='wpsetting.removefilter'>去除滤镜</el-checkbox>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
        </el-tabs>
    </div>

</div>

</template>

<script>

import moment from 'moment';
import domtoimage from 'dom-to-image';
import ImageCompressor from 'image-compressor.js';
import {cosUpload} from '../common/cosupload'
var fileSaver = require('file-saver');
var csscoClassList = ['cssco--c1', 'cssco--f2', 'cssco--g3',
    'cssco--p5', 'cssco--lv3', 'cssco--b5', 'cssco--a6',
    'cssco--kk2', 'cssco--m5', 'cssco--m3', 'cssco--hb1',
    'cssco--hb2', 'cssco--acg', 'cssco--x1', 'cssco--t1'
]
var cssgramClassList = ['_1977', 'aden', 'brannan', 'brooklyn', 'clarendon',
    'earlybird', 'gingham', 'hudson', 'inkwell', 'kelvin', 'lark', 'lofi', 'maven',
    'mayfair', 'moon', 'nashville', 'perpetua', 'reyes', 'rise', 'slumber', 'stinson',
    'toaster', 'valencia', 'walden', 'willow', 'xpro2'
]


export default {
    name: 'editor',
    data() {
        return {
            activedTab: 'imageupload',
            imageSrc: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMA
            AAAl21bKAAAAA1BMVEX/TQBcNTh/AAAAAXRSTlPM0jRW/QAAAApJREFUeJxjYgAAAAYA
            AzY3fKgAAAAASUVORK5CYII=`,
            csscoClassList,
            cssgramClassList,
            imageClass: 'image',
            content: '',
            date: '',
            vol: '000',
            brightness: 100,
            contrast: 100,
            grayscale: 0,
            invert: 0,
            saturate: 100,
            huerotate: 0,
            sepia: 0,
            activedTab: 'extra',
            filterMode: 'cssco',
            overlaymode: 'none',
            imageMode: true,
            overlayColor: {
                full: 'rgba(0,0,0,.3)',
                outter: 'rgba(0,0,0,.7)',
                inner: 'rgba(0,0,0,0)'
            },
            wpsetting: {
                removeoverlay: true,
                removefilter: false
            },
            directUpload:false,
            exporting: false,
            previewDialog: false,
            imageData: {
              blob:{
                front: null,
                wp: null
              },
              dataurl:{
                front: '',
                wp: ''
              }
            }
        }
    },
    computed: {
        overlayStyle() {
                switch (this.overlaymode) {
                    case 'none':
                        return {};
                    case 'full':
                        return {
                            background: this.overlayColor.full
                        };
                    case 'corner':
                        return {
                            background: `radial-gradient(circle, ${this.overlayColor.inner} 20%,${this.overlayColor.outter} 100%)`
                        };
                }
            },
            dispContent() {
                return this.content.replace(new RegExp("\n", "gm"), "<br>");
            },
            dispDate() {
                if (this.date) {
                    return {
                        day: moment(this.date).format('DD'),
                        month: moment(this.date).format('MMM YYYY')
                    }
                } else {
                    return {
                        day: moment().format('DD'),
                        month: moment().format('MMM YYYY')
                    }
                }
            },
            tuneStyleCssco() {
                return this.filterMode == 'cssco' ? {
                    filter: `brightness(${this.brightness}%) contrast(${this.contrast}%)
                  saturate(${this.saturate}%) sepia(${this.sepia}%) invert(${this.invert}%)
                  grayscale(${this.grayscale}%) hue-rotate(${this.huerotate}deg)`
                } : {}
            },
            tuneStyleCssgram() {
                return this.filterMode == 'cssgram' ? {
                    filter: `brightness(${this.brightness}%) contrast(${this.contrast}%)
                  saturate(${this.saturate}%) sepia(${this.sepia}%) invert(${this.invert}%)
                  grayscale(${this.grayscale}%) hue-rotate(${this.huerotate}deg)`
                } : {}
            }
    },
    methods: {
      startDirectUpload(){
        if(!this.$refs.directFront.files[0]||!this.$refs.directBack.files[0]){
          this.$message({
            message: '两张图片都要选好才能上传',
            type: 'error'
          });
          return
        }
        this.imageData.blob = {
          front:this.$refs.directFront.files[0],
          wp:this.$refs.directBack.files[0]
        }
        this.directUpload = false;
        this.startUpload()
      },
      async startUpload(){
        const loading = this.$loading({
            lock: true
        });
        try{
          let time = Date.now()
          let {Key:fronturl} = await cosUpload(this.imageData.blob.front, time+'-front.png','riqian/');
          let {Key:backurl} = await cosUpload(this.imageData.blob.wp, time+'-back.png','riqian/');
          await this.axios.post('image',{
            fronturl,
            backurl,
            content:this.content
          }).then((response)=>{
            this.$message({
              message: '已经追加，在预发布中可以找到张图片',
              type: 'success'
            });
            this.previewDialog = false
            loading.close();
          })
        }catch(e){
          console.log(e)
          loading.close();
          this.previewDialog = false
          this.$message({
            message: '资源服务器挂了，找智力猫看一下。',
            type: 'error'
          });
          return
        }
      },
        tuneformat(val) {
                return val + '%';
            },
            tuneformatdeg(val) {
                return val + 'deg';
            },
            changeTune(cn) {
                switch (cn) {
                    case 'cssco cssco--c1':
                        this.grayscale = 6;
                        this.contrast = 130;
                        break;
                    case 'cssco cssco--f2':
                        this.contrast = 150;
                        break;
                    case 'cssco cssco--g3':
                        this.contrast = 130;
                        break;
                    case 'cssco cssco--p5':
                        this.grayscale = 15;
                        this.contrast = 150;
                        break;
                    case 'cssco cssco--lv3':
                        this.grayscale = 20;
                        this.contrast = 130;
                        break;
                    case 'cssco cssco--b5':
                        this.grayscale = 100;
                        this.contrast = 180;
                        this.brightness = 95;
                        break;
                    case 'cssco cssco--a6':
                        this.grayscale = 30;
                        this.contrast = 140;
                        this.huerotate = -5;
                        break;
                    case 'cssco cssco--kk2':
                        this.grayscale = 30;
                        this.contrast = 170;
                        break;
                    case 'cssco cssco--m5':
                        this.grayscale = 40;
                        this.contrast = 110;
                        break;
                    case 'cssco cssco--m3':
                        this.grayscale = 30;
                        this.contrast = 155;
                        break;
                    case 'cssco cssco--hb1':
                        this.grayscale = 20;
                        this.contrast = 130;
                        break;
                    case 'cssco cssco--hb2':
                        this.grayscale = 20;
                        this.contrast = 130;
                        break;
                    case 'cssco cssco--acg':
                        this.grayscale = 40;
                        this.contrast = 160;
                        this.brightness = 85;
                        this.huerotate = -5;
                        break;
                    case 'cssco cssco--x1':
                        this.grayscale = 100;
                        this.contrast = 195;
                        this.brightness = 110;
                        break;
                    case 'cssco cssco--t1':
                        this.grayscale = 20;
                        this.contrast = 140;
                        break;

                    case 'aden':
                        this.saturate = 85;
                        this.contrast = 90;
                        this.brightness = 120;
                        this.huerotate = -20;
                        break;
                    case 'inkwell':
                        this.sepia = 30;
                        this.contrast = 110;
                        this.brightness = 110;
                        this.grayscale = 100;
                        break;
                    case 'reyes':
                        this.sepia = 22;
                        this.contrast = 85;
                        this.brightness = 110;
                        this.saturate = 75
                        break;
                    case 'gingham':
                        this.huerotate = -10;
                        this.brightness = 105;
                        break;
                    case 'toaster':
                        this.contrast = 150;
                        this.brightness = 90;
                        break;
                    case 'walden':
                        this.huerotate = -10;
                        this.brightness = 110;
                        this.sepia = 30;
                        this.saturate = 160;
                        break;
                    case 'hudson':
                        this.contrast = 90;
                        this.brightness = 120;
                        this.saturate = 110;
                        break;
                    case 'earlybird':
                        this.contrast = 90;
                        this.sepia = 20;
                        break;
                    case 'mayfair':
                        this.contrast = 110;
                        this.saturate = 110;
                        break;
                    case 'lofi':
                        this.contrast = 150;
                        this.saturate = 110;
                        break;
                    case '_1977':
                        this.contrast = 110;
                        this.brightness = 110;
                        this.saturate = 130;
                        break;
                    case 'brooklyn':
                        this.contrast = 90;
                        this.brightness = 110;
                        break;
                    case 'xpro2':
                        this.sepia = 30
                        break;
                    case 'nashville':
                        this.sepia = 20
                        this.contrast = 120
                        this.brightness = 105
                        this.saturate = 120
                        break;
                    case 'lark':
                        this.contrast = 90
                        break;
                    case 'moon':
                        this.contrast = 110
                        this.brightness = 110
                        this.grayscale = 100
                        break;
                    case 'clarendon':
                        this.contrast = 120
                        this.saturate = 135
                        break;
                    case 'willow':
                        this.grayscale = 50
                        this.contrast = 95
                        this.brightness = 90
                        break;
                    case 'rise':
                        this.saturate = 90
                        this.sepia = 20
                        this.contrast = 90
                        this.brightness = 105
                        break;
                    case 'slumber':
                        this.saturate = 66
                        this.brightness = 105
                        break;
                    case 'brannan':
                        this.sepia = 50
                        this.contrast = 140
                        break;
                    case 'valencia':
                        this.sepia = 8
                        this.brightness = 108
                        this.contrast = 108
                        break;
                    case 'maven':
                        this.sepia = 25
                        this.brightness = 95
                        this.contrast = 95
                        this.saturate = 150
                        break;
                    case 'stinson':
                        this.brightness = 115
                        this.contrast = 75
                        this.saturate = 85
                        break;
                    case 'stinson':
                        this.brightness = 115
                        this.contrast = 75
                        this.saturate = 85
                        break;
                }
            },
            saveImage() {
                const loading = this.$loading({
                    lock: true
                });
                this.exporting = true;
                var capturezone = document.querySelector('.capturezone');
                setTimeout(() => {
                    domtoimage.toBlob(capturezone)
                        .then((blob) => {
                            new ImageCompressor(blob, {
                                convertSize: 1258290,
                                success: (result) => {
                                    fileSaver.saveAs(result, 'JRoutput_' + Date.now() + '.png');
                                    this.exporting = false
                                    loading.close();
                                }
                            });
                        });
                }, 0)
            },
            changeBg() {
                this.$refs.backgroundinput.click();
            },
            applybgtocanvas(ev) {
                var f = ev.target.files[0]
                var fr = new FileReader()
                fr.readAsDataURL(f)
                fr.onload = (ev) => {
                    this.imageSrc = ev.target.result;
                }
            },
            upload() {
                const loading = this.$loading({
                    lock: true
                });
                this.exporting = true;
                this.imageMode = true
                var capturezone = document.querySelector('.capturezone');
                setTimeout(() => {
                    domtoimage.toBlob(capturezone)
                        .then((blob) => {
                            new ImageCompressor(blob, {
                                convertSize: 1258290,
                                success: (result) => {
                                    this.imageData.blob.front = result
                                    var fr = new FileReader()
                                    fr.readAsDataURL(result)
                                    fr.onload = (ev) => {
                                        this.imageData.dataurl.front = ev.target.result;
                                        this.imageMode = false
                                        var capturezone = document.querySelector('.capturezone');
                                        setTimeout(() => {
                                            domtoimage.toBlob(capturezone)
                                                .then((blob) => {
                                                    new ImageCompressor(blob, {
                                                        convertSize: 1258290,
                                                        success: (result) => {
                                                          this.imageData.blob.wp = result
                                                            var fr = new FileReader()
                                                            fr.readAsDataURL(result)
                                                            fr.onload = (ev) => {
                                                                this.imageData.dataurl.wp = ev.target.result;
                                                                this.imageMode = true
                                                                this.exporting = false
                                                                loading.close();
                                                                this.previewDialog = true
                                                            }
                                                        }
                                                    });
                                                })
                                        }, 0)
                                    }
                                }
                            });
                        });
                }, 0)
            },
            changeFilter(ev) {
                if (ev.target.dataset.class || ev.target.parentElement.dataset.class) {
                    this.resetTune()
                    var cn = ev.target.dataset.class || ev.target.parentElement.dataset.class;
                    this.imageClass = 'image ' + cn
                    if (!cn.startsWith('cssco')) {
                        this.filterMode = 'cssgram'
                    } else {
                        this.filterMode = 'cssco'
                    }
                    this.changeTune(cn)
                }
            },
            resetTune() {
                this.brightness = 100
                this.contrast = 100
                this.grayscale = 0
                this.invert = 0
                this.saturate = 100
                this.huerotate = 0
                this.sepia = 0
            }
    }
}

</script>
