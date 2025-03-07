import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import dts from 'vite-plugin-dts'
import { resolve } from "node:path"

export default defineConfig({
  plugins: [vue(), dts({ insertTypesEntry : true, rollupTypes : true })],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "VueButton",
			formats : ['es','cjs'],
      fileName: (f) => `index.${f === 'es' ? 'esm' : 'cjs' }.js`,
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
})

