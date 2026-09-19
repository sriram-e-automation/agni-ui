import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/* AgniUI is a LIBRARY build, not an app build.
   Two things here are load-bearing:
   - `external` keeps React out of the bundle. Two copies of React in one page
     break hooks with an error that reads like nonsense.
   - `cssCodeSplit: false` emits one stylesheet, matching the two files
     consumers link (styles.css for tokens, agniui.css for utilities). */
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AgniUI",
      formats: ["es", "cjs"],
      fileName: (f) => (f === "es" ? "agniui.js" : "agniui.cjs"),
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: { react: "React", "react-dom": "ReactDOM" },
        assetFileNames: "[name][extname]",
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
    emptyOutDir: true,
  },
});
