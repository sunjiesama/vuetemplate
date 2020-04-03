<template>
  <div>
    <div class="moodBox">
      <div class="publish">
        <el-input
          v-model="mootForm.content"
          type="textarea"
          :rows="5"
          placeholder="请输入内容"
          class="textarea"
        />
        <div class="moodBoxBottom">
          <el-button size="mini" @click="addmood">发表</el-button>
          <div v-if="Emoji" class="EmojiBox">
            <img
              v-for="emoji in emojiList"
              :key="emoji.url"
              :src="emojiPath(emoji.url)"
              alt
              class="emoji"
              @click="chooseEmoji(emoji.meaning)"
            >
          </div>
          <img src="@/assets/emoji/emoji-1.png" alt @click="showEmoji">
          <div>
            <el-tag
              v-for="tag in mootForm.dynamicTags"
              :key="tag"
              closable
              :disable-transitions="false"
              @close="handleClose(tag)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="inputVisible"
              ref="saveTagInput"
              v-model="inputValue"
              class="input-new-tag"
              size="small"
              @keyup.enter.native="handleInputConfirm"
              @blur="handleInputConfirm"
            />
            <el-button
              v-else
              class="button-new-tag"
              size="small"
              @click="showInput"
            >添加标签</el-button>
          </div>
        </div>
      </div>
    </div>
    <div class="infinite-list-wrapper" style="overflow:auto">
      <ul
        v-infinite-scroll="load"
        class="list"
        infinite-scroll-disabled="disabled"
      >
        <li v-for="(i,index) in list" :key="index" class="list-item">
          <div class="top">
            <div class="articleTitle">{{ i.nickName }}</div>
            <div class="rise">
              <div>
                <i class="el-icon-date articleDate">&#8194; {{ i.date }}</i>
              </div>
              <div class="articleLabel">
                &#8194;
                <template>
                  <el-tag
                    v-for="(itag, tagindex) in labelToArray(i.label)"
                    :key="tagindex"
                    size="mini"
                  >{{ itag }}</el-tag>
                </template>
              </div>
            </div>
          </div>
          <div class="body">
            <div class="articleContent">
              {{ aposEscapeCharacter(i.content) }}
            </div>
            <el-link
              :underline="false"
              class="readMore"
              @click="readMore(i.id)"
            >查看全文</el-link>
          </div>
          <div class="foot">
            <span class="articleAuthor">作者：{{ i.author }}</span>
            <el-link
              :underline="false"
              class="link_del"
              @click="delMoments(i.id, index)"
            >删除</el-link>
          </div>
        </li>
      </ul>
      <div class="loadingAndnoMore">
        <p v-if="loading">加载中...</p>
        <p v-if="noMore">没有更多了</p>
      </div>
    </div>
  </div>
</template>

<script>
import { moments } from "@/api/table";
import { emojiList } from "@/assets/emoji/index.js";
export default {
  inject: ["reload"],
  data() {
    return {
      inputVisible: false,
      inputValue: "",
      emojiList,
      Emoji: false,
      textarea: "",
      total: 0,
      loading: false,
      list: [],
      form: {
        type: "search",
        pageSize: 5,
        pageNum: 1
      },
      mootForm: {
        type: "insert",
        nickName: "alice",
        content: "",
        motto: "",
        dynamicTags: []
      }
    };
  },
  computed: {
    noMore() {
      return this.form.pageNum >= Math.floor(this.total / this.form.pageSize);
      /*  return this.count >= 20 */
    },
    disabled() {
      return this.loading || this.noMore;
    }
  },
  created() {
    this.getlist();
  },
  methods: {
    // 关闭标签
    handleClose(tag) {
      this.mootForm.dynamicTags.splice(
        this.mootForm.dynamicTags.indexOf(tag),
        1
      );
    },
    // 展示标签
    showInput() {
      this.inputVisible = true;
      // eslint-disable-next-line no-unused-vars
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 添加标签
    handleInputConfirm() {
      const inputValue = this.inputValue;
      if (inputValue) {
        this.mootForm.dynamicTags.push(inputValue);
      }
      this.inputVisible = false;
      this.inputValue = "";
    },
    // 单引号转义
    aposEscapeCharacter(str) {
      if (str) {
        const reg = new RegExp("&apos", "gi");
        return (str = str.replace(reg, "'"));
      }
    },
    // 处理emoji路径
    emojiPath(url) {
      return require(`../../assets/emoji/emoji-${url}.png`);
    },
    // 分割label为数组
    labelToArray(a) {
      if (a) {
        const arr = a.split(",");
        return arr;
      }
    },
    addmood() {
      if (this.mootForm.content) {
        if (this.mootForm.content.length <= 10) {
          this.$message({
            message: "内容太少了,在多说两句吧",
            type: "warning"
          });
        } else {
          const reg = new RegExp("'", "gi");
          this.mootForm.content = this.mootForm.content.replace(reg, "&apos");
          moments(this.mootForm)
            .then(res => {
              if (res.data.code === 200) {
                this.mootForm.content = "";
                this.$message({
                  message: res.data.msg,
                  type: "success"
                });
                this.reload();
              } else {
                this.$message({
                  message: res.data.msg,
                  type: "warning"
                });
              }
            })
            .catch(err => {
              this.$message({
                message: err.data.msg,
                type: "warning"
              });
            });
        }
      } else {
        this.$message({
          message: "不能发布空的内容",
          type: "warning"
        });
      }
    },
    getlist() {
      moments(this.form)
        .then(res => {
          if (res.data.code === 200) {
            this.total = res.data.total["count(*)"];
            this.list = this.list.concat(res.data.data);
          }
        })
        .catch(() => {});
    },
    load() {
      this.loading = true;
      setTimeout(() => {
        this.form.pageNum += 1;
        this.getlist();
        this.loading = false;
      }, 2000);
    },
    delMoments(id, index) {
      const obj = {
        type: "delete",
        id: id
      };
      moments(obj)
        .then(res => {
          if (res.data.code === 200) {
            this.$message({
              message: res.data.msg,
              type: "success"
            });
            this.list.splice(index, 1);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    showEmoji() {
      this.Emoji = !this.Emoji;
    },
    chooseEmoji(chooseEmoji) {
      this.mootForm.content += chooseEmoji;
      this.Emoji = false;
    },
    readMore(id) {
      localStorage.setItem("readMore", id);
      this.$router.push({
        path: "/article/index"
      });
    }
  }
};
</script>
<style lang="less" scoped>

.moodBox {
  width: 100%;
  padding: 0 50px;
  box-sizing: border-box;

  /deep/.el-textarea__inner {
    border: none !important;
  }
  /deep/.el-textarea__inner:hover {
    border: 1px solid #dcdfe6;
  }
  .moodContent {
    width: 100%;
  }
  .publish {
    border: 1px solid #dcdfe6;
    padding: 20px 5px 5px;
    position: relative;
    .EmojiBox {
      position: absolute;
      bottom: 20%;
      left: 0;
      width: 39%;
      height: 30%;
       /* background: url("../../../assets/svg/emojis.png"); */
      .emoji {
        width: 32px;
        height: 32px;
      }
    }
  }
  .moodBoxBottom {
    display: flex;
    .el-tag + .el-tag {
      margin-left: 10px;
    }
    .button-new-tag {
      margin-left: 10px;
      height: 32px;
      line-height: 30px;
      padding-top: 0;
      padding-bottom: 0;
    }
    .input-new-tag {
      width: 90px;
      margin-left: 10px;
      vertical-align: bottom;
    }
  }
}
.el-carousel__item h3 {
  color: #475669;
  font-size: 14px;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
ul {
  padding: 0 30px;
  li {
    box-sizing: border-box;
    padding: 30px 50px;
    height: 250px;
    list-style-type: none;
    display: flex;
    flex-direction: column;
    .top {
      display: flex;
      flex-direction: column;
      flex-grow: 0;
      .articleTitle {
        color: #455a64;
        font: bold 20px "";
        margin-bottom: 20px;
      }
      .headerIMG {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }
      .rise {
        display: flex;
        .articleLabel > span {
          margin: 0 5px;
        }
        .articleDate {
          color: #bdbdbd;
        }
      }
      span {
        /* margin-left: 20px; */
        color: rgb(127, 161, 255);
      }
    }
    .body {
      flex-grow: 2;

      .articleContent {
        padding: 5px 10px;
        width: 100%;
        height: 60%;
        text-indent: 2rem;
        overflow: hidden;
        color: #424242;
        font-size: 12px;
        line-height: 40px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
      .readMore {
        padding-right: 20px;
        display: block;
        height: 40px;
        text-align: right;
        line-height: 40px;
      }
    }
    .foot {
      flex-grow: 0;
      .link_del {
        float: right;
        margin-right: 20px;
      }
      .articleAuthor {
        color: #8d6e63;
      }
    }
  }
  li:nth-of-type(odd) {
    background: rgba(181, 211, 211, 0.116);
  }
  li:nth-of-type(even) {
    background: rgba(166, 179, 179, 0.143);
  }
}
</style>
<style>
.loadingAndnoMore p {
  height: 40px;
  font: bold 20px/40px "";
  text-align: center;
  color: rgb(114, 114, 114);
}
</style>
