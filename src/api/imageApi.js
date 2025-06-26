import axios from "axios";

const BASE_URL = "http://47.107.172.202:8080"; // 后端服务器地址

// 处理文件路径，将Windows路径转换为URL安全的格式
function normalizeFilePath(filePath) {
  // 将Windows路径中的反斜杠转换为正斜杠
  return filePath.replace(/\\/g, "/");
}

// 生成uniqueKey的函数
async function generateUniqueKey(fileName, fileSize, lastModified) {
  // 将文件信息组合成一个字符串
  const fileInfo = `${fileName}_${fileSize}_${lastModified}`;
  // 使用Web Crypto API生成哈希
  const encoder = new TextEncoder();
  const data = encoder.encode(fileInfo);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  // 将ArrayBuffer转换为十六进制字符串，只取前32位
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const imageApi = {
  // 添加新的图片记录
  async addImage(imageData) {
    try {
      console.log("准备上传图片:", imageData);

      // 验证必要参数
      if (!imageData.fileName || !imageData.file) {
        throw new Error("缺少必要的参数：fileName或file");
      }

      // 生成uniqueKey
      const uniqueKey = await generateUniqueKey(
        imageData.fileName,
        imageData.file.size,
        imageData.file.lastModified
      );

      // 创建 FormData 对象
      const formData = new FormData();

      // 按照接口文档添加必要参数
      formData.append("uniqueKey", uniqueKey);
      formData.append("imgName", imageData.fileName);
      formData.append("img", imageData.file); // 二进制文件
      formData.append("dev", "development"); // 可选参数
      formData.append("dir", normalizeFilePath(imageData.filePath)); // 可选参数
      formData.append("userId", "45"); // 用户ID

      console.log("发送上传图片请求，uniqueKey:", uniqueKey);
      const response = await axios.post(`${BASE_URL}/images/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // 按照接口文档验证响应
      if (response.data.code === 0) {
        // 成功状态码为0
        console.log("图片上传成功:", response.data);
        return {
          code: response.data.code,
          msg: response.data.msg || "",
          data: response.data.data || null,
        };
      } else {
        throw new Error(response.data.msg || "上传失败");
      }
    } catch (error) {
      console.error("添加图片失败:", error.response?.data || error.message);
      throw error;
    }
  },

  // 删除图片接口
  async deleteImages(images) {
    try {
      console.log("准备删除图片:", images);

      // 确保images是数组
      const imageArray = Array.isArray(images) ? images : [images];

      // 处理每个图片的删除请求
      const deletePromises = imageArray.map(async (image) => {
        // 验证必要参数
        if (!image.fileName || !image.filePath) {
          throw new Error(
            `缺少必要的参数：fileName或filePath，图片信息：${JSON.stringify(
              image
            )}`
          );
        }

        // 构造请求参数
        const params = {
          uniqueKey:
            image.uniqueKey ||
            (await generateUniqueKey(
              image.fileName,
              image.size || 0,
              image.lastModified || Date.now()
            )),
          imgName: image.fileName,
          dev: "development",
          dir: normalizeFilePath(image.filePath),
          userId: 45, // 注意：这里的userId需要是整数类型
        };

        console.log("发送删除图片请求，参数:", params);

        // 发送删除请求
        const response = await axios.post(`${BASE_URL}/images/remove`, params, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // 处理响应
        if (response.data.code === 200) {
          // 成功状态码为200
          console.log("图片删除成功:", response.data);
          return {
            code: response.data.code,
            msg: response.data.msg || "success",
            data: response.data.data || null,
          };
        } else {
          throw new Error(response.data.msg || "删除失败");
        }
      });

      // 等待所有删除请求完成
      const results = await Promise.all(deletePromises);
      console.log("所有图片删除完成:", results);
      return results;
    } catch (error) {
      console.error("删除图片失败:", error);
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

  // 图搜图接口
  async searchImage(imageFile, num = 5) {
    try {
      console.log("准备发送图搜图请求:", {
        fileName: imageFile.name,
        fileSize: imageFile.size,
        resultCount: num,
      });

      // 验证参数
      if (!imageFile || !(imageFile instanceof File)) {
        throw new Error("无效的图片文件");
      }

      if (!imageFile.type.startsWith("image/")) {
        throw new Error("文件类型必须是图片");
      }

      // 创建 FormData 对象
      const formData = new FormData();
      formData.append("img", imageFile); // 二进制文件
      formData.append("num", num); // 指定返回图片数量

      console.log("发送图搜图请求...");
      const response = await axios.post(`${BASE_URL}/search/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // 处理响应
      if (response.data.code === 200) {
        console.log("图搜图请求成功:", response.data);

        // 处理返回的数据
        const searchResults = response.data.data.ranklist.map((item) => ({
          imgName: item.imgName,
          path: item.path,
          dev: item.dev,
          url: item.url, // 预览图地址
        }));

        return {
          code: response.data.code,
          msg: response.data.msg || "success",
          data: {
            ranklist: searchResults,
          },
        };
      } else {
        throw new Error(response.data.msg || "搜索失败");
      }
    } catch (error) {
      console.error("图搜图失败:", error.response?.data || error.message);
      throw error;
    }
  },
};
