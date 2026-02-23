import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["src/**/*.{test,spec}.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            include: ["src/controllers/*.ts", "src/services/*.ts", "src/middlewares/*.ts"],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 80,
                statements: 80
            }
        },
        mockReset: true,
        restoreMocks: true,
        clearMocks: true,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@test": path.resolve(__dirname, "./src/test"),
        },
    },
});
