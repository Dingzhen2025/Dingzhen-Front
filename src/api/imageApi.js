import axios from "axios";

const BASE_URL = "http://8.138.83.109:8080"; // 后端服务器地址

// 处理文件路径，将Windows路径转换为URL安全的格式
function normalizeFilePath(filePath) {
  // 将Windows路径中的反斜杠转换为正斜杠
  return filePath.replace(/\\/g, "/");
}

export const imageApi = {
  // 添加新的图片记录
  async addImage(imageData) {
    try {
      console.log("准备上传图片:", imageData);

      // 创建 FormData 对象
      const formData = new FormData();
      formData.append("imgName", imageData.fileName);
      formData.append("img", imageData.file); // 需要实际的文件对象
      formData.append("dev", "1bdjwqdwq"); // 设备标识
      formData.append("dir", normalizeFilePath(imageData.filePath));
      formData.append("userid", "1"); // 用户ID

      console.log("发送上传图片请求");
      const response = await axios.post(`${BASE_URL}/images/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          // 这里需要添加 token，从登录后的存储中获取
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.code === 200) {
        console.log("图片上传成功");
        return response.data;
      } else {
        throw new Error(response.data.error || "上传失败");
      }
    } catch (error) {
      console.error("添加图片失败:", error.response?.data || error.message);
      throw error;
    }
  },

  // 删除图片记录
  async deleteImage(imageInfo) {
    try {
      console.log("准备删除图片:", imageInfo);

      // 准备删除请求的数据
      const formData = new FormData();
      formData.append("imgName", imageInfo.fileName);
      formData.append("dev", "1bdjwqdwq"); // 设备标识
      formData.append("dir", normalizeFilePath(imageInfo.filePath));
      formData.append("userid", "1"); // 用户ID

      console.log("发送删除图片请求");
      const response = await axios.post(`${BASE_URL}/images/remove`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          // 这里需要添加 token，从登录后的存储中获取
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.code === 200) {
        console.log("图片删除成功");
        return response.data;
      } else {
        throw new Error(response.data.error || "删除失败");
      }
    } catch (error) {
      console.error("删除图片失败:", error.response?.data || error.message);
      throw error;
    }
  },

  // 批量删除图片记录
  async deleteImages(images) {
    try {
      console.log("开始批量删除图片...");
      const results = await Promise.allSettled(
        images.map((image) => this.deleteImage(image))
      );

      // 检查结果
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `删除图片失败 ${images[index].filePath}:`,
            result.reason
          );
        }
      });

      return {
        success: true,
        results: results.map((result, index) => ({
          filePath: images[index].filePath,
          success: result.status === "fulfilled",
          error: result.status === "rejected" ? result.reason.message : null,
        })),
      };
    } catch (error) {
      console.error("批量删除图片失败:", error);
      throw error;
    }
  },

  // 批量添加图片记录
  async addImages(images) {
    try {
      console.log("开始批量添加图片...");
      const results = await Promise.allSettled(
        images.map((image) => this.addImage(image))
      );

      // 检查结果
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `添加图片失败 ${images[index].filePath}:`,
            result.reason
          );
        }
      });

      return {
        success: true,
        results: results.map((result, index) => ({
          filePath: images[index].filePath,
          success: result.status === "fulfilled",
          error: result.status === "rejected" ? result.reason.message : null,
        })),
      };
    } catch (error) {
      console.error("批量添加图片失败:", error);
      throw error;
    }
  },

  // 更新图片记录
  async updateImage(filePath, imageData) {
    try {
      // 使用 encodeURIComponent 来处理文件路径中的特殊字符
      const encodedPath = encodeURIComponent(filePath);
      const response = await axios.put(
        `${BASE_URL}/images/path/${encodedPath}`,
        imageData
      );
      return response.data;
    } catch (error) {
      console.error("更新图片失败:", error);
      throw error;
    }
  },

  // 批量同步图片记录
  async syncImages(images) {
    try {
      const response = await axios.post(`${BASE_URL}/images/sync`, { images });
      return response.data;
    } catch (error) {
      console.error("同步图片失败:", error);
      throw error;
    }
  },
};
