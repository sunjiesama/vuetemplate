<template>
  <div class="app-container">
    <transition name="el-zoom-in-top">
      <div v-show="show" class="transition-box">
        <el-button @click="resetDateFilter">清除日期过滤器</el-button>
        <el-button @click="clearFilter">清除所有过滤器</el-button>
        <el-table
          ref="filterTable"
          :data="tableData"
          style="width: 100%"
          stripe
          @cell-dblclick="edit"
        >
          <el-table-column
            prop="userName"
            label="姓名"
            width="180"
          />
          <el-table-column prop="gender" label="性别" width="100">
            <template slot-scope="scope">
              {{ scope.row.gender === "1" ? "男性" : "女性" }}
            </template>
          </el-table-column>
          <el-table-column
            prop="address"
            label="地址"
            :formatter="formatter"
          />
          <el-table-column
            prop="date"
            label="日期"
            border
            sortable
            width="180"
            column-key="date"
            :filters="[
              { text: '2016-05-01', value: '2016-05-01' },
              { text: '2016-05-02', value: '2016-05-02' },
              { text: '2016-05-03', value: '2016-05-03' },
              { text: '2016-05-04', value: '2016-05-04' }
            ]"
            :filter-method="filterHandler"
          />

          <el-table-column
            prop="tag"
            label="标签"
            width="100"
            :filters="[
              { text: '家', value: '家' },
              { text: '公司', value: '公司' }
            ]"
            :filter-method="filterTag"
            filter-placement="bottom-end"
          >
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.tag === '家' ? 'primary' : 'success'"
                disable-transitions
              >{{ scope.row.tag }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template slot-scope="scope">
              <!-- <el-button size="mini" @click="handleEdit(scope.$index, scope.row)"
              >编辑</el-button
            >-->
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.$index, scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 编辑表单 -->
        <el-dialog title="编辑用户信息" :visible.sync="dialogFormVisible">
          <el-form
            ref="ruleForm"
            :model="ruleForm"
            :rules="rules"
            label-width="100px"
            class="demo-ruleForm"
            size="mini"
          >
            <el-form-item label="姓名" prop="name">
              <el-input v-model="ruleForm.userName" />
            </el-form-item>
            <el-form-item label="地址" prop="region">
              <v-distpicker
                class="regionSelect"
                @selected="onSelected"
              />
            </el-form-item>
            <el-form-item label="日期" required>
              <el-col :span="11">
                <el-form-item prop="date1">
                  <el-date-picker
                    v-model="ruleForm.date1"
                    disabled
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
              <el-col class="line" :span="2">-</el-col>
              <el-col :span="11">
                <el-form-item prop="date2">
                  <el-time-picker
                    v-model="ruleForm.date2"
                    disabled
                    placeholder="选择时间"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="ruleForm.gender">
                <el-radio label="1" />
                <el-radio label="0" />
              </el-radio-group>
            </el-form-item>
            <el-form-item label="个人简介" prop="desc">
              <el-input v-model="ruleForm.desc" type="textarea" />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="resetForm('ruleForm')">取 消</el-button>
            <el-button
              type="primary"
              @click="submitForm('ruleForm')"
            >确 定</el-button>
          </div>
        </el-dialog>
      </div>
    </transition>
  </div>
</template>

<script>
import { getUserList, deleteUser, updateUser } from "@/api/table";
export default {
  inject: ["reload"],
  data() {
    return {
      isEdit: false,
      show: false,
      tableData: [],
      dialogFormVisible: false,
      ruleForm: {},
      rules: {
        name: [
          { required: true, message: "请输入姓名", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" }
        ],
        region: [{ required: true, message: "请输入地址", trigger: "change" }],
        date1: [
          {
            type: "date",
            required: true,
            message: "请选择日期",
            trigger: "change"
          }
        ],
        date2: [
          {
            type: "date",
            required: true,
            message: "请选择时间",
            trigger: "change"
          }
        ],
        gender: [{ required: true, message: "请选择性别", trigger: "change" }],
        desc: [{ required: true, message: "请填写个人简介", trigger: "blur" }]
      },
      formLabelWidth: "120px"
    };
  },
  created() {
    setTimeout(() => {
      this.show = true;
    }, 500);
    getUserList()
      .then(res => {
        if (res.data.code === 200) {
          this.tableData = res.data.data;
        }
      })
      .catch(err => {
        console.log(err);
      });
  },
  methods: {
    edit(row, column, cell) {
      console.log(cell);

      const _this = this;
      if (column.property === "userName" && !column.isEdit) {
        column.isEdit = true;
        const oldValue = cell.children[0].innerText;
        console.log(oldValue);

        cell.children[0].style.display = "none";
        cell.innerHTML = `<input class=edit value='${oldValue}'></input>`;
        const a = document.querySelector(".edit");
        a.focus();
        a.select();

        a.onblur = function() {
          if (!a.value || a.value === oldValue) {
            cell.children[0].style.display = "none";
            cell.innerHTML = `<div class=cell>${oldValue}</div>`;
            column.isEdit = false;
          } else {
            const obj = {
              user_id: row.user_id,
              userName: a.value
            };
            _this
              .$confirm("是否更新?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
              })
              .then(() => {
                updateUser(obj)
                  .then(res => {
                    if (res.data.code === 200) {
                      _this.$message({
                        type: "success",
                        message: res.data.msg
                      });
                      _this.reload();
                    }
                  })
                  .catch(err => {
                    console.log(err);
                  });
              })
              .catch(() => {
                _this.$message({
                  type: "info",
                  message: "已取消"
                });
                cell.children[0].style.display = "none";
                cell.innerHTML = `<div class=cell>${oldValue}</div>`;
                column.isEdit = false;
              });
          }
        };
      }
    },
    onSelected(data) {
      console.log(data);
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.dialogFormVisible = false;
          alert("submit!");
        } else {
          this.dialogFormVisible = false;
          return false;
        }
      });
    },
    resetForm(formName) {
      this.dialogFormVisible = false;
      this.$refs[formName].resetFields();
    },
    resetDateFilter() {
      this.$refs.filterTable.clearFilter("date");
    },
    clearFilter() {
      this.$refs.filterTable.clearFilter();
    },
    formatter(row /* column */) {
      return row.address;
    },
    filterTag(value, row) {
      return row.tag === value;
    },
    filterHandler(value, row, column) {
      const property = column["property"];
      return row[property] === value;
    },
    handleEdit(index, row) {
      this.ruleForm = row;
      this.dialogFormVisible = true;
    },
    handleDelete(index, row) {
      deleteUser({ id: row.user_id })
        .then(res => {
          if (res.data.code === 200) {
            this.$message({
              message: "成功",
              type: "success"
            });
          }
          this.tableData.splice(index, 1);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>
<style lang="less">
.regionSelect {
  select {
    padding: 0 5px;
    height: 28px;
    color: #606266;
    font-size: 12px;
  }
}
.edit {
  margin-left: 10px;
  width: 80%;
}
</style>
