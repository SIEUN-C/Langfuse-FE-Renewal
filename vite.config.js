// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // 'path' 모듈을 사용하기 위해 이 줄을 추가해야 합니다.

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // 오류 로그에 나온 경로 별칭들을 여기에 모두 추가해줍니다.
      { find: 'components', replacement: path.resolve(__dirname, 'src/components') },
      { find: 'lib', replacement: path.resolve(__dirname, 'src/lib') },
      // 다른 별칭이 있다면 여기에 추가...
      // 예: { find: 'assets', replacement: path.resolve(__dirname, 'src/assets') },
    ],
  },
})
