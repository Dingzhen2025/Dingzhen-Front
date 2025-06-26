import axios from "axios";
import { useUserStore } from "../stores/user";

const BASE_URL = "http://47.107.172.202:8080"; // 后端服务器地址

// 处理文件路径，将Windows路径转换为URL安全的格式
export function normalizeFilePath(filePath) {
  // 将Windows路径中的反斜杠转换为正斜杠
  return filePath.replace(/\\/g, "/");
}

// 生成uniqueKey的函数
export async function generateUniqueKey(fileName, fileSize, lastModified) {
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
      const userStore = useUserStore();
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
      formData.append("dir", normalizeFilePath(imageData.dir || "")); // 使用修正后的dir
      formData.append("userId", userStore.userId?.toString()); // 使用实际用户ID

      console.log("发送上传图片请求，uniqueKey:", uniqueKey);
      const response = await axios.post(`${BASE_URL}/images/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // 按照接口文档验证响应
      if (response.data.code === 200) {
        // 成功状态码为200
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
        if (!image.imgName && !image.fileName) {
          throw new Error(
            `缺少必要的参数：imgName或fileName，图片信息：${JSON.stringify(
              image
            )}`
          );
        }
        // 构造FormData参数
        const formData = new FormData();
        formData.append("uniqueKey", image.uniqueKey);
        formData.append("imgName", image.imgName || image.fileName);
        formData.append("dev", image.dev || "development");
        formData.append("dir", image.dir);
        formData.append("userId", String(image.userId));

        console.log(
          "发送删除图片请求，参数:",
          Object.fromEntries(formData.entries())
        );

        // 发送删除请求
        const response = await axios.post(
          `${BASE_URL}/images/remove`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

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
  async searchImage(imageFile, libraryPath, num = 10) {
    try {
      const userStore = useUserStore();
      console.log("准备发送图搜图请求:", {
        fileName: imageFile.name,
        fileSize: imageFile.size,
        resultCount: num,
        libraryPath: libraryPath,
        userId: userStore.userId,
      });

      // 验证参数
      if (!imageFile || !(imageFile instanceof File)) {
        throw new Error("无效的图片文件");
      }
      if (!libraryPath) {
        throw new Error("缺少图片库目录(dir)参数");
      }
      if (!userStore.userId) {
        throw new Error("缺少用户ID(userId)参数");
      }

      // 创建 FormData 对象
      const formData = new FormData();
      formData.append("img", imageFile);
      formData.append("num", num);
      formData.append("dev", "development"); // 根据其他接口实现，暂时硬编码
      formData.append("dir", libraryPath);
      formData.append("userId", userStore.userId.toString());

      console.log("发送图搜图请求...");
      const response = await axios.post(`${BASE_URL}/images/query`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // 处理响应
      if (response.data.code === 200) {
        console.log("图搜图请求成功:", response.data);

        // 根据最新文档，结果数组字段为 "results"
        const searchResults = response.data.data.results.map((item) => ({
          ...item,
          // 如果需要，可以在这里对返回的字段进行调整
        }));

        return {
          code: response.data.code,
          msg: response.data.msg,
          data: {
            // 使用 "results" 字段
            results: searchResults,
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

  // 图搜图
  async searchByImage(file) {
    try {
      const userStore = useUserStore();
      // 构造表单数据
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userStore.userId?.toString()); // 使用实际用户ID，如果未登录则使用默认值

      // 发送搜索请求
      const response = await axios({
        method: "post",
        url: `${BASE_URL}/image/search`,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // 验证响应数据
      if (!response.data) {
        throw new Error("搜索失败：响应数据为空");
      }

      // 根据响应状态处理
      if (response.data.code === 200) {
        return {
          success: true,
          message: "搜索成功",
          data: response.data.data,
        };
      } else {
        throw new Error(response.data.msg || "搜索失败");
      }
    } catch (error) {
      console.error("搜索失败:", error);
      throw new Error(error.response?.data?.msg || error.message || "搜索失败");
    }
  },
};
