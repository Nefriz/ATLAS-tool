/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_WORLD_IDS: string;
    readonly VITE_AUTO_CONNECT: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
