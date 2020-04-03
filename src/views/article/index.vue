<template>
  <div class="app-container">
    <transition name="el-fade-in">
      <div v-if="show" class="box">{{ content }}</div>
    </transition>
  </div>
</template>
<script>
import { moments } from "@/api/table";
export default {
  data() {
    return {
      show: false,
      content: ""
    };
  },
  created() {
    this.getId();
    setTimeout(() => {
      this.show = true;
    }, 500);
  },
  methods: {
    getId() {
      const id = localStorage.getItem("readMore");
      moments({
        type: "readMore",
        id: id
      })
        .then(res => {
          this.content = res.data.data.content;
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>
<style lang="less" scoped>
.box {
  white-space: pre-wrap;
  box-sizing: border-box;
  width: 60%;
  height: 100%;
  padding: 20px 100px;
  left: 0px;
  top: 0px;
  margin: auto;
  border-radius: 5%;
}
</style>
