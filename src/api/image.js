// 图片操作接口
import request from './request';

// 上传图片
export const uploadImage = (image) => {
    const formData = new FormData();
    formData.append('imgName', image.name);
    formData.append('img', image.file);
    formData.append('dev', image.dev || 'electron');
    formData.append('dir', image.dir || '');
    return request.post('/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// 删除图片
export const removeImage = (imgName) =>
    request.post('/images/remove', { imgName });

// 图搜图
export const searchImage = (image, num = 5) => {
    const formData = new FormData();
    formData.append('img', image);
    formData.append('num', num);
    return request.post('/search/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};