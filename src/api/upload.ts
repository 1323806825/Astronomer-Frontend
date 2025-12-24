import api from './request'

// 上传响应类型
export interface UploadImageResponse {
  file_url: string
  file_name: string
  file_size: number
}

export interface UploadFileResponse {
  file_url: string
  file_name: string
  file_size: number
  category?: string
}

export const uploadAPI = {
  // 上传图片
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<UploadImageResponse>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 上传文件
  uploadFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<UploadFileResponse>('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 批量上传
  uploadMultiple: (files: File[]) => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    return api.post<{ success_count: number; files: UploadFileResponse[] }>('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 删除文件
  deleteFile: (fileUrl: string) => {
    return api.delete('/upload/delete', { data: { file_url: fileUrl } })
  }
}
